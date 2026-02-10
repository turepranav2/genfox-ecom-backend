import express from "express";
import { adminAuth } from "../middleware/adminAuth.middleware";
import {
  adminLogin,
  getAllUsers,
  deleteUser,
  getAllSuppliers,
  approveSupplier,
  rejectSupplier
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

export default router;