import { Logger } from "../utils/logger.js";
import Product from "../models/product.js";
import mongoose from "mongoose";

const getAllProducts = async (req, res) => {
  const logger = {};
  try {
    logger.started = true;
    const products = await Product.find();

    logger.productsExist = Boolean(products?.length);
    if (!products || !products.length) {
      return res.status(404).json({
        success: false,
        message: "No products found",
      });
    }

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    logger.error = error;
    res.status(500).json({
      success: false,
      message: "Failed to retrieve products",
      error: error.message,
    });
  } finally {
    Logger.debug("getAllProducts", logger);
  }
};

const getProductsByCategoryId = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const products = await Product.find({
      category: new mongoose.Types.ObjectId(categoryId),
    });
    if (!products || !products.length) {
      return res.status(404).json({
        success: false,
        message: "No products found in this category",
      });
    }

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve products",
      error: error.message,
    });
  }
};

export { getProductsByCategoryId, getAllProducts };
