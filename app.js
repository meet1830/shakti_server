
import categoryRoutes from "./routes/category.js";
import connectDB from "./config/connect.js";
import constantRoutes from "./routes/constant.js";
import cors from "cors";
import express from "express";
import { getConfig } from "./config/config.js";
import healthRoutes from "./routes/health.js";
import helmet from "helmet";
import orderRoutes from "./routes/order.js";
import productRoutes from "./routes/product.js";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/user.js";

const app = express();
// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: getConfig.ALLOWED_ORIGINS,
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

app.use((req, res, next) => {
  if (!req.headers.source) {
    return res.status(403).json({ error: "request not allowed" });
  }
  next();
});

// Routes
app.use("/user", userRoutes);
app.use("/category", categoryRoutes);
app.use("/product", productRoutes);
app.use("/order", orderRoutes);
app.use("/constants", constantRoutes);
app.use("/health", healthRoutes);


// Error handling middleware - should be last middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const start = async () => {
  try {
    await connectDB(getConfig.MONGO_URI)
      .then(() => console.log("DB connected"))
      .catch((error) => console.log("DB connection error", error));


    app.listen({ port: getConfig.PORT, host: "0.0.0.0" }, (err, addr) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Server started on http://localhost:${getConfig.PORT}`);
      }
    });
  } catch (error) {
    console.log("error starting server", error);
  }
};

start();
