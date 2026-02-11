import express from "express";
import { adminAuth } from "../middleware/adminAuth.middleware";
import {
  adminLogin,
  getAllUsers,
  deleteUser,
  getAllSuppliers,
  approveSupplier,
  rejectSupplier,
  getAllProductsAdmin,
  approveProduct,
  rejectProduct
} from "../controllers/admin.controller";

const router = express.Router();

router.post("/login", adminLogin);

/* USER MANAGEMENT */
router.get("/users", adminAuth, getAllUsers);
router.delete("/users/:id", adminAuth, deleteUser);

/* SUPPLIER MANAGEMENT */
router.get("/suppliers", adminAuth, getAllSuppliers);
router.put("/suppliers/:id/approve", adminAuth, approveSupplier);
router.put("/suppliers/:id/reject", adminAuth, rejectSupplier);

/* PRODUCT MANAGEMENT */
router.get("/products", adminAuth, getAllProductsAdmin);
router.put("/products/:id/approve", adminAuth, approveProduct);
router.put("/products/:id/reject", adminAuth, rejectProduct);

export default router;