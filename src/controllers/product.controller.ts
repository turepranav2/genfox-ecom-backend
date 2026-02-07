import { Request, Response } from "express";
import { Types } from "mongoose";
import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService
} from "../services/product.service";
import { SupplierRequest } from "../middleware/supplierAuth.middleware";

/* SUPPLIER: CREATE PRODUCT */
export const createProduct = async (
  req: SupplierRequest,
  res: Response
) => {
  const { name, price, stock, category, images } = req.body;

  if (!name || price == null || stock == null || !category) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!req.supplierId) {
    return res.status(401).json({ message: "Unauthorized supplier" });
  }

  const supplierObjectId = new Types.ObjectId(req.supplierId);

  const product = await createProductService({
    name,
    price,
    stock,
    category,
    images,
    supplier: supplierObjectId
  });

  res.status(201).json(product);
};

/* PUBLIC: GET ALL PRODUCTS */
export const getAllProducts = async (_req: Request, res: Response) => {
  const products = await getAllProductsService();
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

  const supplierObjectId = new Types.ObjectId(req.supplierId);

  const product = await updateProductService(
    id,
    supplierObjectId,
    req.body
  );

  if (!product) {
    return res.status(404).json({ message: "Product not found or unauthorized" });
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
    return res.status(404).json({ message: "Product not found or unauthorized" });
  }

  res.json({ message: "Product deleted successfully" });
};