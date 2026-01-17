import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const generateTokens = (id) => {
  const accessToken = jwt.sign(
    { id, type: "access" },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "2h" }
  );

  const refreshToken = jwt.sign(
    { id, type: "refresh" },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30d" }
  );

  return { accessToken, refreshToken };
};

const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
});
async function verifyGoogleToken(idToken) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
      email: payload.email,
      name: payload.name,
      id: payload.sub,
    };
  } catch (error) {
    throw new Error("Invalid Google token");
  }
}

const loginOrSignup = async (req, res) => {
  try {
    const { idToken, authType } = req.body;

    if (!idToken || !authType) {
      return res.status(400).json({ error: "Invalid params" });
    }

    let authUser;
    if (authType === "google") authUser = await verifyGoogleToken(idToken);

    if (!authUser) {
      return res.status(404).json({
        error: `${String(authType)} user not found`,
      });
    }

    let user = await User.findOne({ email: authUser.email });

    if (!user) {
      user = new User({
        email: authUser.email,
        name: authUser.name,
      });
    } else {
      user.name = authUser.name;
      user.email = authUser.email;
    }

    const { accessToken, refreshToken } = generateTokens(user?._id);

    user.refreshToken = refreshToken;

    await user.save();

    res.status(200).json({
      user,
      refreshToken,
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { [refreshToken]: "" } },
            { new: true }
          );
          console.log("test delete ", updatedUser);
          return res
            .status(403)
            .json({ error: "Invalid or expired refresh token" });
        }

        if (decoded.type !== "refresh") {
          return res.status(403).json({ error: "Invalid token type" });
        }

        const { accessToken, refreshToken } = generateTokens(decoded.id);

        const updatedUser = await User.findByIdAndUpdate(
          req.params.id,
          { $set: { [refreshToken]: refreshToken } },
          { new: true }
        );
        console.log("test updated", updatedUser);

        res.status(200).json({
          accessToken,
          refreshToken,
        });
      }
    );
    res.status(500).json("Something went wrong");
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
  try {
    await User.updateOne(
      { email: req.user.id },
      { $set: req.body },
      { new: false }
    );

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export { loginOrSignup, refreshAccessToken, logout, updateUser };
