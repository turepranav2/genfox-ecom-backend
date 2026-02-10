import Order from "../models/Order";
import Product from "../models/Product";
import Cart from "../models/Cart";
import { Types } from "mongoose";

const COMMISSION_PERCENT = 10;

/* ────────── CREATE ORDER ────────── */
export const createOrderService = async (
  userId: string,
  items: { productId: string; quantity: number }[],
  address: string
) => {
  const orderItems = [];
  let total = 0;

  for (const item of items) {
    if (!Types.ObjectId.isValid(item.productId)) {
      throw new Error(`Invalid product ID: ${item.productId}`);
    }

    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);

    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    product.stock -= item.quantity;
    await product.save();

    const itemTotal = product.price * item.quantity;
    total += itemTotal;

    orderItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      supplierId: product.supplierId,
      image:
        product.images && product.images.length > 0 ? product.images[0] : ""
    });
  }

  const commission = (total * COMMISSION_PERCENT) / 100;

  const order = await Order.create({
    userId: new Types.ObjectId(userId),
    items: orderItems,
    total,
    commission,
    paymentMethod: "COD",
    address,
    status: "PENDING",
    paymentStatus: "PENDING"
  });

  // Clear user's cart after successful order
  await Cart.findOneAndUpdate({ userId }, { items: [] });

  return order;
};

/* ────────── USER: GET OWN ORDERS ────────── */
export const getUserOrdersService = (userId: string) => {
  return Order.find({ userId })
    .populate("items.productId", "name price images")
    .sort({ createdAt: -1 });
};

/* ────────── SUPPLIER: GET ORDERS ────────── */
export const getSupplierOrdersService = (supplierId: string) => {
  return Order.find({ "items.supplierId": supplierId })
    .populate("userId", "name email phone")
    .populate("items.productId", "name price images")
    .sort({ createdAt: -1 });
};

/* ────────── ADMIN: GET ALL ORDERS ────────── */
export const getAllOrdersService = () => {
  return Order.find()
    .populate("userId", "name email phone")
    .populate({
      path: "items.productId",
      select: "name price images supplierId",
      populate: { path: "supplierId", select: "name email" }
    })
    .sort({ createdAt: -1 });
};

/* ────────── ADMIN: UPDATE STATUS (legacy) ────────── */
export const updateOrderStatusService = (orderId: string, status: string) => {
  return Order.findByIdAndUpdate(orderId, { status }, { new: true })
    .populate("userId", "name email phone")
    .populate("items.productId", "name price images");
};

/* ────────── SUPPLIER: UPDATE STATUS ────────── */
export const supplierUpdateStatusService = async (
  orderId: string,
  supplierId: string,
  newStatus: string
) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  // Verify supplier owns items in this order
  const hasItems = order.items.some(
    (item: any) => item.supplierId.toString() === supplierId
  );
  if (!hasItems)
    throw new Error("Unauthorized: order does not contain your products");

  // Validate status transition
  const statusFlow = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentIndex = statusFlow.indexOf(order.status);
  const newIndex = statusFlow.indexOf(newStatus);

  if (newIndex === -1) throw new Error("Invalid status");
  if (newIndex <= currentIndex)
    throw new Error("Cannot go backwards in status");
  if (newIndex > currentIndex + 1) throw new Error("Cannot skip statuses");

  order.status = newStatus as any;
  await order.save();

  return Order.findById(orderId)
    .populate("userId", "name email phone")
    .populate("items.productId", "name price images");
};

/* ────────── SUPPLIER: CONFIRM DELIVERY ────────── */
export const supplierDeliverService = async (
  orderId: string,
  supplierId: string,
  cashCollected: number,
  supplierConfirmed: boolean
) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  const hasItems = order.items.some(
    (item: any) => item.supplierId.toString() === supplierId
  );
  if (!hasItems)
    throw new Error("Unauthorized: order does not contain your products");

  order.status = "DELIVERED";
  order.paymentStatus = "PAID";
  order.deliveryConfirmation = {
    supplierConfirmed: supplierConfirmed || true,
    userConfirmed: order.deliveryConfirmation?.userConfirmed || false,
    cashCollected: cashCollected || 0,
    deliveredAt: new Date(),
    userConfirmedAt: order.deliveryConfirmation?.userConfirmedAt || null
  };

  await order.save();

  return Order.findById(orderId)
    .populate("userId", "name email phone")
    .populate("items.productId", "name price images");
};

/* ────────── USER: CONFIRM RECEIPT ────────── */
export const userConfirmReceiptService = async (
  orderId: string,
  userId: string
) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  if (order.userId.toString() !== userId) {
    throw new Error("Unauthorized: this is not your order");
  }

  if (order.status !== "DELIVERED") {
    throw new Error("Order must be DELIVERED before confirming receipt");
  }

  order.deliveryConfirmation = {
    supplierConfirmed: order.deliveryConfirmation?.supplierConfirmed || false,
    userConfirmed: true,
    cashCollected: order.deliveryConfirmation?.cashCollected || 0,
    deliveredAt: order.deliveryConfirmation?.deliveredAt || null,
    userConfirmedAt: new Date()
  };

  await order.save();

  return Order.findById(orderId).populate(
    "items.productId",
    "name price images"
  );
};