import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory
} from "../controllers/category.controller";
import { supplierAuth } from "../middleware/supplierAuth.middleware";

const router = express.Router();

/* PUBLIC */
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

/* SUPPLIER (auth required) */
router.post("/", supplierAuth, createCategory);
router.put("/:id", supplierAuth, updateCategory);
router.delete("/:id", supplierAuth, deleteCategory);

/* SUBCATEGORIES (supplier auth required) */
router.post("/:id/subcategories", supplierAuth, addSubcategory);
router.put("/:id/subcategories/:subId", supplierAuth, updateSubcategory);
router.delete("/:id/subcategories/:subId", supplierAuth, deleteSubcategory);

export default router;
