import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  getSupplierProducts,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller";
import { supplierAuth } from "../middleware/supplierAuth.middleware";

const router = express.Router();

/* PUBLIC */
router.get("/", getAllProducts);

/* SUPPLIER — must be BEFORE /:id to avoid "supplier" being treated as an ID */
router.get("/supplier", supplierAuth, getSupplierProducts);

router.get("/:id", getProductById);

/* SUPPLIER */
router.post("/", supplierAuth, createProduct);
router.put("/:id", supplierAuth, updateProduct);
router.delete("/:id", supplierAuth, deleteProduct);

export default router;