import { Request, Response } from "express";
import { Types } from "mongoose";
import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  getSupplierProductsService,
  updateProductService,
  deleteProductService
} from "../services/product.service";
import { SupplierRequest } from "../middleware/supplierAuth.middleware";

/* SUPPLIER: CREATE PRODUCT */
export const createProduct = async (
  req: SupplierRequest,
  res: Response
) => {
  try {
    const { name, price, stock, category, images, description, mrp } = req.body;

    if (!name || price == null || stock == null || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.supplierId) {
      return res.status(401).json({ message: "Unauthorized supplier" });
    }

    // Validate image URLs
    if (images && images.length > 0) {
      for (const img of images) {
        if (!img.startsWith("http://") && !img.startsWith("https://")) {
          return res.status(400).json({
            message:
              "Image URLs must be absolute URLs (starting with http:// or https://)"
          });
        }
      }
    }

    const supplierObjectId = new Types.ObjectId(req.supplierId);

    const product = await createProductService({
      name,
      price,
      stock,
      category,
      images,
      description: description || "",
      mrp: mrp || 0,
      supplierId: supplierObjectId
    });

    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/* PUBLIC: GET ALL PRODUCTS */
export const getAllProducts = async (_req: Request, res: Response) => {
  const products = await getAllProductsService();
  res.json(products);
};

/* SUPPLIER: GET OWN PRODUCTS */
export const getSupplierProducts = async (
  req: SupplierRequest,
  res: Response
) => {
  if (!req.supplierId) {
    return res.status(401).json({ message: "Unauthorized supplier" });
  }

  const products = await getSupplierProductsService(req.supplierId);
  res.json(products);
};

/* PUBLIC: GET PRODUCT BY ID */
export const getProductById = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const product = await getProductByIdService(id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
};

/* SUPPLIER: UPDATE PRODUCT */
export const updateProduct = async (
  req: SupplierRequest,
  res: Response
) => {
  if (!req.supplierId) {
    return res.status(401).json({ message: "Unauthorized supplier" });
  }

  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  // Validate image URLs if provided
  if (req.body.images && req.body.images.length > 0) {
    for (const img of req.body.images) {
      if (!img.startsWith("http://") && !img.startsWith("https://")) {
        return res.status(400).json({
          message:
            "Image URLs must be absolute URLs (starting with http:// or https://)"
        });
      }
    }
  }

  const supplierObjectId = new Types.ObjectId(req.supplierId);

  const product = await updateProductService(
    id,
    supplierObjectId,
    req.body
  );

  if (!product) {
    return res
      .status(404)
      .json({ message: "Product not found or unauthorized" });
  }

  res.json(product);
};

/* SUPPLIER: DELETE PRODUCT */
export const deleteProduct = async (
  req: SupplierRequest,
  res: Response
) => {
  if (!req.supplierId) {
    return res.status(401).json({ message: "Unauthorized supplier" });
  }

  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const supplierObjectId = new Types.ObjectId(req.supplierId);

  const product = await deleteProductService(id, supplierObjectId);

  if (!product) {
    return res
      .status(404)
      .json({ message: "Product not found or unauthorized" });
  }

  res.json({ message: "Product deleted successfully" });
};