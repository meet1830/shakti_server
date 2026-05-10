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

const getPaginatedProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    
    const totalCount = await Product.countDocuments();
    const products = await Product.find()
      .populate("category", "name")
      .skip(page * limit)
      .limit(limit)
      .lean();
      
    res.status(200).json({ products, totalCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminUpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    // Don't allow changing core id or categories from this endpoint directly for now
    const { _id, category, ...updateData } = req.body;

    // If image_uris explicitly provided, allow updating it
    if (req.body.image_uris) {
      updateData.image_uris = req.body.image_uris;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("category", "name");
    
    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminCreateProduct = async (req, res) => {
  try {
    const { name, price, original_price, weight, description, image_uris } = req.body;

    if (!name || !price || !weight) {
      return res.status(400).json({ error: 'Missing required fields: name, price, weight' });
    }

    const productData = {
      name,
      price,
      original_price,
      weight,
      description,
      image_uris: Array.isArray(image_uris) ? image_uris : [],
      category: [],
    };

    const created = await Product.create(productData);
    const populated = await Product.findById(created._id).populate('category', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getProductsByCategoryId, getAllProducts, getPaginatedProducts, adminUpdateProduct, deleteProduct, adminCreateProduct };
