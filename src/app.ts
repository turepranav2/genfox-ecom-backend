import express from "express";
import cors from "cors";
import morgan from "morgan";

import { errorMiddleware } from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
import supplierAuthRoutes from "./routes/supplier.auth.routes";
import supplierRoutes from "./routes/supplier.routes";
import adminRoutes from "./routes/admin.routes";

const app = express();

/* ---------- GLOBAL MIDDLEWARE (ORDER MATTERS) ---------- */
app.use(cors());
app.use(express.json()); // <-- THIS FIXES req.body
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(errorMiddleware);

/* ---------- HEALTH CHECK ---------- */
app.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/supplier/auth", supplierAuthRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/admin", adminRoutes);

export default app;