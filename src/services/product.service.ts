import Product, { IProduct } from "../models/Product";
import { Types } from "mongoose";

/* CREATE */
export const createProductService = async (
  data: Omit<IProduct, "createdAt" | "updatedAt">
) => {
  return Product.create(data);
};

/* GET ALL (public — only active & approved products) */
export const getAllProductsService = async () => {
  return Product.find({ isActive: true, approvalStatus: "APPROVED" }).populate("supplierId", "name email");
};

/* GET BY ID */
export const getProductByIdService = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) return null;
  return Product.findById(id).populate("supplierId", "name email");
};

/* GET SUPPLIER'S OWN PRODUCTS */
export const getSupplierProductsService = async (supplierId: string) => {
  return Product.find({ supplierId }).sort({ createdAt: -1 });
};

/* UPDATE (SUPPLIER ONLY) */
export const updateProductService = async (
  productId: string,
  supplierId: Types.ObjectId,
  updateData: Partial<IProduct>
) => {
  if (!Types.ObjectId.isValid(productId)) return null;

  return Product.findOneAndUpdate(
    { _id: productId, supplierId },
    updateData,
    { new: true }
  );
};

/* DELETE (SUPPLIER ONLY) */
export const deleteProductService = async (
  productId: string,
  supplierId: Types.ObjectId
) => {
  if (!Types.ObjectId.isValid(productId)) return null;

  return Product.findOneAndDelete({
    _id: productId,
    supplierId
  });
};

/* ────────── ADMIN PRODUCT SERVICES ────────── */

/* GET ALL PRODUCTS (admin — all statuses) */
export const getAllProductsAdminService = async () => {
  return Product.find({}).populate("supplierId", "name email").sort({ createdAt: -1 });
};

/* APPROVE PRODUCT */
export const approveProductService = async (productId: string) => {
  if (!Types.ObjectId.isValid(productId)) return null;
  return Product.findByIdAndUpdate(
    productId,
    { approvalStatus: "APPROVED" },
    { new: true }
  ).populate("supplierId", "name email");
};

/* REJECT PRODUCT */
export const rejectProductService = async (productId: string) => {
  if (!Types.ObjectId.isValid(productId)) return null;
  return Product.findByIdAndUpdate(
    productId,
    { approvalStatus: "REJECTED" },
    { new: true }
  ).populate("supplierId", "name email");
};