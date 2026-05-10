import {
  adminCreateProduct,
  adminUpdateProduct,
  deleteProduct,
  getAllProducts,
  getPaginatedProducts,
  getProductsByCategoryId
} from "../controllers/product.js";
import { verifyAccessToken, verifyAdmin } from "../middlewares/auth.js";

import express from "express";

const router = express.Router();

router.get("/", verifyAccessToken, getAllProducts);
router.get("/:categoryId", verifyAccessToken, getProductsByCategoryId);

// Admin Routes
router.get("/admin/products", verifyAdmin, getPaginatedProducts);
router.post("/admin/products", verifyAdmin, adminCreateProduct);
router.put("/admin/products/:id", verifyAdmin, adminUpdateProduct);
router.delete("/admin/products/:id", verifyAdmin, deleteProduct);

export default router;
