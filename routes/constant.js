import express from "express";
import { getConstants } from "../controllers/constant.js";

const router = express.Router();

router.get("/", getConstants);

export default router;
