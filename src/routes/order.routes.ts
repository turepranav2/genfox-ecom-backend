import express from "express";
import {
  createOrder,
  getUserOrders,
  confirmReceipt,
  getSupplierOrders,
  supplierUpdateStatus,
  supplierDeliver,
  getAllOrders,
  updateOrderStatus
} from "../controllers/order.controller";
import { userAuth } from "../middleware/userAuth.middleware";
import { supplierAuth } from "../middleware/supplierAuth.middleware";
import { adminAuth } from "../middleware/adminAuth.middleware";

const router = express.Router();

/* USER */
router.post("/", userAuth, createOrder);
router.get("/my", userAuth, getUserOrders);
router.put("/:id/confirm-receipt", userAuth, confirmReceipt);

/* SUPPLIER */
router.get("/supplier", supplierAuth, getSupplierOrders);
router.put("/supplier/:id/status", supplierAuth, supplierUpdateStatus);
router.put("/supplier/:id/deliver", supplierAuth, supplierDeliver);

/* ADMIN */
router.get("/admin", adminAuth, getAllOrders);
router.put("/admin/:id/status", adminAuth, updateOrderStatus);

export default router;