import express from "express";
import { supplierAuth } from "../middleware/supplierAuth.middleware";
import {
  getSupplierProfile,
  updateSupplierProfile,
  getPaymentSummary,
  getPaymentTransactions
} from "../controllers/supplier.controller";

const router = express.Router();

/* PROFILE */
router.get("/profile", supplierAuth, getSupplierProfile);
router.put("/profile", supplierAuth, updateSupplierProfile);

/* PAYMENTS */
router.get("/payments/summary", supplierAuth, getPaymentSummary);
router.get("/payments/transactions", supplierAuth, getPaymentTransactions);

export default router;