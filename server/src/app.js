import shareholderRoutes from "./routes/shareholder.routes.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import shareAllocationRoutes from "./routes/shareAllocation.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import installmentRoutes from "./routes/installment.routes.js";


const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

// install route mount
app.use("/api/installments", installmentRoutes);

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

// Authentication routes
app.use("/api/auth", authRoutes);

// share holders routes
app.use("/api/shareholders", shareholderRoutes);

app.use("/api/project", projectRoutes);

app.use("/api/share-allocations", shareAllocationRoutes);

app.use("/api/payments", paymentRoutes);


app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VilasShare API is running",
    environment: process.env.NODE_ENV,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

export default app;
