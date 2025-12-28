import { PORT } from "./config/config.js";
import { buildAdminJS } from "./config/setup.js";
import categoryRoutes from "./routes/category.js";
import connectDB from "./config/connect.js";
import express from "express";
import orderRoutes from "./routes/order.js";
import productRoutes from "./routes/product.js";
import userRoutes from "./routes/user.js";

const app = express();

app.use(express.json());

// Routes
app.use("/user", userRoutes);
app.use("/category", categoryRoutes);
app.use("/product", productRoutes);
app.use("/order", orderRoutes);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
      .then(() => console.log("DB connected"))
      .catch((error) => console.log("DB connection error", error));

    // await buildAdminJS(app);

    app.listen({ port: PORT, host: "0.0.0.0" }, (err, addr) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Server started on http://localhost:${PORT}`);
      }
    });
  } catch (error) {
    console.log("error starting server", error);
  }
};

start();
