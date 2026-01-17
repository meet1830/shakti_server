import {
  getAllProducts,
  getProductsByCategoryId,
} from "../controllers/product.js";

import express from "express";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", verifyAccessToken, getAllProducts);
router.get("/:categoryId", verifyAccessToken, getProductsByCategoryId);

export default router;
