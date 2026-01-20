import { PORT } from "./config/config.js";
import { buildAdminJS } from "./config/setup.js";
import categoryRoutes from "./routes/category.js";
import connectDB from "./config/connect.js";
import constantRoutes from "./routes/constant.js";
import cors from "cors";
import express from "express";
import healthRoutes from "./routes/health.js";
import helmet from "helmet";
import { initKeepAliveCron } from "./utils/cron.js";
import orderRoutes from "./routes/order.js";
import productRoutes from "./routes/product.js";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/user.js";

const app = express();
// Security middleware
app.use(helmet());
app.use(
  cors({
    // origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    origin: "http://localhost:2000",
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `windowMs`
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

app.use(express.json());

// Routes
app.use("/user", userRoutes);
app.use("/category", categoryRoutes);
app.use("/product", productRoutes);
app.use("/order", orderRoutes);
app.use("/constants", constantRoutes);
app.use("/health", healthRoutes);

// for admin js
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
  );
  next();
});

// Error handling middleware - should be last middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

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
        initKeepAliveCron();

        console.log(`Server started on http://localhost:${PORT}`);
        // console.log(`Server started on http://localhost:${PORT}/admin`);
      }
    });
  } catch (error) {
    console.log("error starting server", error);
  }
};

start();
