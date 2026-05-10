import {
  createOrder,
  getAdminCurrentOrdersItemsSummary,
  getAdminOrdersSummary,
  getAdminOrders,
  getOrders,
} from "../controllers/order.js";

import express from "express";
import { verifyAccessToken, verifyAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verifyAccessToken, createOrder);
router.get("/", verifyAccessToken, getOrders);

// Admin routes
router.get("/admin/summary", verifyAdmin, getAdminOrdersSummary);
router.get("/admin/items-summary", verifyAdmin, getAdminCurrentOrdersItemsSummary);
router.get("/admin/orders", verifyAdmin, getAdminOrders);

export default router;
