import express from "express";
import { adminAuth } from "../middleware/adminAuth.middleware";
import { supplierAuth } from "../middleware/supplierAuth.middleware";
import {
  getAdminDashboardMetrics,
  getSupplierDashboardMetrics
} from "../controllers/dashboard.controller";

const router = express.Router();

/* ADMIN DASHBOARD */
router.get("/admin", adminAuth, getAdminDashboardMetrics);

/* SUPPLIER DASHBOARD */
router.get("/supplier", supplierAuth, getSupplierDashboardMetrics);

export default router;