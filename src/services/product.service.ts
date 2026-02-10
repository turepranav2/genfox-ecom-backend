import Product, { IProduct } from "../models/Product";
import { Types } from "mongoose";

/* CREATE */
export const createProductService = async (
  data: Omit<IProduct, "createdAt" | "updatedAt">
) => {
  return Product.create(data);
};

/* GET ALL (public — only active products) */
export const getAllProductsService = async () => {
  return Product.find({ isActive: true }).populate("supplierId", "name email");
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