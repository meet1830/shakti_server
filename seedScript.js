import { categoriesData, productData } from "./seedData.js";
import mongoose, { Types } from "mongoose";

import Category from "./models/category.js";
import Product from "./models/product.js";
import dotenv from "dotenv";

dotenv.config();

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Product.deleteMany({});
    await Category.deleteMany({});

    const categoryDocs = await Category.insertMany(categoriesData);

    const categoryMap = categoryDocs.reduce((map, category) => {
      map[category.name] = category._id;
      return map;
    });

    const productWithCategoryIds = productData.map((product) => ({
      ...product,
      category: categoryMap[product.category],
    }));

    await Product.insertMany(productWithCategoryIds);
    console.log('DB seeded successfully');
  } catch (error) {
    console.log("error seeding database", error);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
