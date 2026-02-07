import Order from "../models/Order";
import Product from "../models/Product";
import { Types } from "mongoose";

const COMMISSION_PERCENT = 10;

export const createOrderService = async (
  userId: string,
  items: { productId: string; quantity: number }[],
  address: string
) => {
  const orderItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error("Product not found");

    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    product.stock -= item.quantity;
    await product.save();

    const price = product.price * item.quantity;
    totalAmount += price;

    orderItems.push({
      product: product._id,
      supplier: product.supplier,
      quantity: item.quantity,
      price
    });
  }

  const commissionAmount = (totalAmount * COMMISSION_PERCENT) / 100;

  return Order.create({
    user: new Types.ObjectId(userId),
    items: orderItems,
    totalAmount,
    commissionAmount,
    paymentMethod: "COD",
    address
  });
};

export const getUserOrdersService = (userId: string) => {
  return Order.find({ user: userId })
    .populate("items.product")
    .sort({ createdAt: -1 });
};

export const getSupplierOrdersService = (supplierId: string) => {
  return Order.find({ "items.supplier": supplierId })
    .populate("items.product")
    .populate("user", "name email")
    .sort({ createdAt: -1 });
};

export const getAllOrdersService = () => {
  return Order.find()
    .populate("user", "name email")
    .populate("items.product")
    .sort({ createdAt: -1 });
};

export const updateOrderStatusService = (
  orderId: string,
  status: string
) => {
  return Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );
};