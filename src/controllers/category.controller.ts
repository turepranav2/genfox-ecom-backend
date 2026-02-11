import { Request, Response } from "express";
import Category from "../models/Category";
import { SupplierRequest } from "../middleware/supplierAuth.middleware";

/* PUBLIC: GET ALL ACTIVE CATEGORIES */
export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      name: 1
    });
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

/* PUBLIC: GET SINGLE CATEGORY */
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const id =
      typeof req.params.id === "string" ? req.params.id : req.params.id[0];
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch category" });
  }
};

/* SUPPLIER: CREATE CATEGORY */
export const createCategory = async (
  req: SupplierRequest,
  res: Response
) => {
  try {
    const { name, image } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await Category.create({
      name,
      image: image || "",
      supplierId: req.supplierId || null
    });

    res.status(201).json({ category });
  } catch (err: any) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "A category with this name already exists" });
    }
    res.status(400).json({ message: err.message });
  }
};

/* SUPPLIER: UPDATE CATEGORY */
export const updateCategory = async (
  req: SupplierRequest,
  res: Response
) => {
  try {
    const id =
      typeof req.params.id === "string" ? req.params.id : req.params.id[0];
    const { name, image, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name !== undefined) category.name = name;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    res.json({ category });
  } catch (err: any) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "A category with this name already exists" });
    }
    res.status(400).json({ message: err.message });
  }
};

/* SUPPLIER: DELETE CATEGORY */
export const deleteCategory = async (
  req: SupplierRequest,
  res: Response
) => {
  try {
    const id =
      typeof req.params.id === "string" ? req.params.id : req.params.id[0];

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted" });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to delete category" });
  }
};

/* SUPPLIER: ADD SUBCATEGORY */
export const addSubcategory = async (
  req: SupplierRequest,
  res: Response
) => {
  try {
    const id =
      typeof req.params.id === "string" ? req.params.id : req.params.id[0];
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Subcategory name is required" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.subcategories.push({ name, slug: "" } as any);
    await category.save();

    const newSub =
      category.subcategories[category.subcategories.length - 1];
    res.status(201).json({ subcategory: newSub });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/* SUPPLIER: UPDATE SUBCATEGORY */
export const updateSubcategory = async (
  req: SupplierRequest,
  res: Response
) => {
  try {
    const id =
      typeof req.params.id === "string" ? req.params.id : req.params.id[0];
    const subId =
      typeof req.params.subId === "string"
        ? req.params.subId
        : req.params.subId[0];
    const { name } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const sub = category.subcategories.id
      ? category.subcategories.id(subId)
      : (category.subcategories as any).find(
          (s: any) => s._id.toString() === subId
        );

    if (!sub) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    if (name !== undefined) {
      sub.name = name;
      sub.slug = ""; // Will be regenerated on save
    }

    await category.save();
    res.json({ subcategory: sub });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/* SUPPLIER: DELETE SUBCATEGORY */
export const deleteSubcategory = async (
  req: SupplierRequest,
  res: Response
) => {
  try {
    const id =
      typeof req.params.id === "string" ? req.params.id : req.params.id[0];
    const subId =
      typeof req.params.subId === "string"
        ? req.params.subId
        : req.params.subId[0];

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const subIndex = category.subcategories.findIndex(
      (s: any) => s._id.toString() === subId
    );

    if (subIndex === -1) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    category.subcategories.splice(subIndex, 1);
    await category.save();
    res.json({ message: "Subcategory deleted" });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to delete subcategory" });
  }
};
