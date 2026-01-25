import { getConfig } from "../config/config.js";
import jwt from "jsonwebtoken";

function verifyAccessToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, getConfig.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      return res.status(403).json({ error: "Invalid token" });
    }

    if (decoded.type !== "access") {
      return res.status(403).json({ error: "Invalid token type" });
    }

    req.user = decoded;
    next();
  });
}

export { verifyAccessToken };
