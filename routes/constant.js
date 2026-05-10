import express from "express";
import { getConstants, updateConstant } from "../controllers/constant.js";

const router = express.Router();

router.get("/", getConstants);
router.put("/:id", updateConstant);

export default router;
