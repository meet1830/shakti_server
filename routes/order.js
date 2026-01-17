import { createOrder, getOrders } from "../controllers/order.js";

import express from "express";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verifyAccessToken, createOrder);
router.get("/", verifyAccessToken, getOrders);

export default router;
