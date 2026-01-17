import express from "express";
import { getAllCategories } from "../controllers/category.js";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", verifyAccessToken, getAllCategories);

export default router;
