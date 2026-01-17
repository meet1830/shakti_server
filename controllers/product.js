import Product from "../models/product.js";
import mongoose from "mongoose";

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

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
    res.status(500).json({
      success: false,
      message: "Failed to retrieve products",
      error: error.message,
    });
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
