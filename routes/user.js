import {
  loginOrSignup,
  logout,
  refreshAccessToken,
  updateUser,
} from "../controllers/user.js";

import express from "express";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", loginOrSignup);
router.post("/refresh", refreshAccessToken);
router.post("/logout", verifyAccessToken, logout);
router.post("/updateUser", verifyAccessToken, updateUser);

export default router;
