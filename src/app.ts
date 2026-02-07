import express from "express";
import cors from "cors";
import morgan from "morgan";

import { errorMiddleware } from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
import supplierAuthRoutes from "./routes/supplier.auth.routes";
import supplierRoutes from "./routes/supplier.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import cartRoutes from "./routes/cart.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import adminRoutes from "./routes/admin.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

/* HEALTH */
app.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/supplier/auth", supplierAuthRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);

/* ERROR HANDLER (LAST) */
app.use(errorMiddleware);
app.use(
  cors({
    origin: ["http://localhost:5173",],
    credentials: true
  })
);

export default app;