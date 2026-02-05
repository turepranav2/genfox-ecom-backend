import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { apiRateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/error.middleware";
import { applySecurityMiddleware } from "./middleware/security.middleware";

// Routes
import authRoutes from "./routes/auth.routes";
import supplierAuthRoutes from "./routes/supplier.auth.routes";
import adminRoutes from "./routes/admin.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import addressRoutes from "./routes/address.routes";
import orderRoutes from "./routes/order.routes";
import paymentRoutes from "./routes/payment.routes";
import enquiryRoutes from "./routes/enquiry.routes";

const app = express();

applySecurityMiddleware(app);

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(apiRateLimiter);

// 🔹 API ROUTING (FRONTEND CONTRACT)
app.use("/api/auth", authRoutes);
app.use("/api/supplier/auth", supplierAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/enquiry", enquiryRoutes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global error handler (MUST BE LAST)
app.use(errorHandler);

export default app;