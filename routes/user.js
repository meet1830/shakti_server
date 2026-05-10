import {
  loginOrSignup,
  logout,
  refreshAccessToken,
  updateUser,
  getPaginatedUsers,
  adminUpdateUser,
  deleteUser
} from "../controllers/user.js";

import express from "express";
import { verifyAccessToken, verifyAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", loginOrSignup);
router.post("/refresh", refreshAccessToken);
router.post("/logout", verifyAccessToken, logout);
router.post("/updateUser", verifyAccessToken, updateUser);

// Admin Routes
router.get("/admin/users", verifyAdmin, getPaginatedUsers);
router.put("/admin/users/:id", verifyAdmin, adminUpdateUser);
router.delete("/admin/users/:id", verifyAdmin, deleteUser);

export default router;
