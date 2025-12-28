import { createOrder, getOrdersByUserId } from "../controllers/order.js";

import express from "express";

const router = express.Router();

router.post("/", createOrder);
router.get("/:userId", getOrdersByUserId);
export default router;
