import { Logger } from "../utils/logger.js";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";
import appleSignin from "apple-signin-auth";
import { getConfig } from "../config/config.js";
import jwt from "jsonwebtoken";

const generateTokens = (id, role) => {
  const accessToken = jwt.sign(
    { id, role, type: "access" },
    getConfig.ACCESS_TOKEN_SECRET,
    { expiresIn: "2h" },
  );

  const refreshToken = jwt.sign(
    { id, role, type: "refresh" },
    getConfig.REFRESH_TOKEN_SECRET,
    { expiresIn: "30d" },
  );

  return { accessToken, refreshToken };
};

const googleClient = new OAuth2Client({
  clientId: getConfig.GOOGLE_CLIENT_ID,
});
async function verifyGoogleToken(idToken) {
  const logging = {};

  try {
    logging.started = true;
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: [getConfig.GOOGLE_CLIENT_ID, getConfig.WEB_GOOGLE_CLIENT_ID].filter(Boolean),
    });

    logging.ticket = ticket;

    const payload = ticket.getPayload();

    logging.payload = payload;

    return {
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    logging.error = error;
    throw new Error(`Invalid Google token: ${error.message || String(error)}`);
  } finally {
    Logger.debug("verifyGoogleToken", logging);
  }
}

async function verifyAppleToken(identityToken) {
  const logger = {};
  try {
    logger.identityToken = identityToken;
    const decoded = await appleSignin.verifyIdToken(identityToken, {
      audience: getConfig.APPLE_CLIENT_ID,
      ignoreExpiration: true,
    });
    logger.decoded = decoded;
    return decoded;
  } catch (error) {
    logger.error = error;
    throw new Error(`Invalid Apple token: ${error.message || String(error)}`);
  } finally {
    Logger.debug("verifyAppleToken", logger);
  }
}

const loginOrSignup = async (req, res) => {
  const logging = {};
  try {
    const { idToken, authType, email, fullname } = req.body;
    const source = req.headers.source;
    logging.reqParams = req.body;

    if (!idToken || !authType) {
      return res.status(400).json({ error: "Invalid params" });
    }

    let authUser;
    if (authType === "google") {
      authUser = await verifyGoogleToken(idToken);
    } else if (authType === "apple") {
      authUser = await verifyAppleToken(idToken);
    }

    logging.authUser = authUser;

    if (!authUser) {
      return res.status(404).json({
        error: `${String(authType)} user not found`,
      });
    }

    let user;
    if (authType === "google") {
      user = await User.findOne({ email: authUser.email });

      if (!user) {
        if (source === "admin") {
          return res.status(403).json({ error: "Account not found. Please create an account from the mobile application first." });
        }
        user = new User({
          email: authUser.email,
          name: authUser.name,
        });
      } else {
        user.name = authUser.name;
        user.email = authUser.email;
      }
    } else if (authType === "apple") {
      const { sub } = authUser;

      let findUser;
      if (email) {
        findUser = await User.findOne({ email });
        if (!findUser) findUser = await User.findOne({ appleId: sub });
      } else findUser = await User.findOne({ appleId: sub });

      logging.findUser = findUser;

      if (!findUser) {
        if (source === "admin") {
          return res.status(403).json({ error: "Account not found. Please create an account from the mobile application first." });
        }
        user = new User({
          email,
          name: fullname,
          appleId: sub,
        });
      } else {
        findUser.appleId = sub;
        user = findUser;
      }
    }

    logging.user = user;

    if (source === "admin" && !user.role.includes("admin")) {
      return res.status(403).json({ error: "Access denied. You do not have admin privileges." });
    }

    const { accessToken, refreshToken } = generateTokens(user?._id, user?.role);

    user.refreshToken = refreshToken;

    logging.accessToken = accessToken;
    logging.refreshToken = refreshToken;

    const savedUser = await user.save();

    logging.savedUser = savedUser;

    res.status(200).json({
      user,
      refreshToken,
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    logging.error = error;
  } finally {
    Logger.debug("loginOrSignup", logging);
  }
};

async function refreshAccessToken(req, res) {
  try {
    const { userId, refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    const storedToken = await User.findById(userId);
    if (!storedToken) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    jwt.verify(
      refreshToken,
      getConfig.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        try {
          if (err) {
            await User.findByIdAndUpdate(
              userId,
              { $set: { [refreshToken]: "" } },
              { new: false },
            );

            return res
              .status(403)
              .json({ error: "Invalid or expired refresh token" });
          }

          if (decoded.type !== "refresh") {
            return res.status(403).json({ error: "Invalid token type" });
          }

          const { accessToken, refreshToken } = generateTokens(userId, storedToken.role);

          await User.findByIdAndUpdate(
            userId,
            { $set: { [refreshToken]: refreshToken } },
            { new: false },
          );

          res.status(200).json({
            accessToken,
            refreshToken,
          });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function logout(req, res) {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $set: { [refreshToken]: "" },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateUser(req, res) {
  const logger = {};
  try {
    logger.user = req.user;
    logger.reqParams = req.body;
    await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: false, runValidators: true },
    );

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    logger.error = error;
    res.status(500).json({ error: error.message });
  } finally {
    Logger.debug("updateUser", logger);
  }
}

async function getPaginatedUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    
    const totalCount = await User.countDocuments();
    const users = await User.find()
      .select("-appleId -refreshToken")
      .skip(page * limit)
      .limit(limit)
      .lean();
      
    res.status(200).json({ users, totalCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function adminUpdateUser(req, res) {
  try {
    const { id } = req.params;
    // Don't allow changing email or id
    const { email, _id, ...updateData } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-appleId -refreshToken");
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export { loginOrSignup, refreshAccessToken, logout, updateUser, getPaginatedUsers, adminUpdateUser, deleteUser };
