import express from "express";
import { userAuth, UserRequest } from "../middleware/userAuth.middleware";
import Order from "../models/Order";
import Cart from "../models/Cart";
import Supplier from "../models/Supplier";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 */

router.post("/", userAuth, async (req: UserRequest, res) => {
  const { addressId, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.userId }).populate(
    "items.product"
  );

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const supplierId = (cart.items[0].product as any).supplier;

  const supplier = await Supplier.findById(supplierId);
  const commissionRate = supplier?.commissionRate || 10;

  const items = cart.items.map((item: any) => ({
    product: item.product._id,
    quantity: item.quantity,
    price: item.product.price
  }));

  const totalAmount = items.reduce(
  (sum: number, item: { price: number; quantity: number }) =>
    sum + item.price * item.quantity,
  0
);

  const commissionAmount = (totalAmount * commissionRate) / 100;
  const supplierEarning = totalAmount - commissionAmount;

  const order = await Order.create({
    user: req.userId,
    supplier: supplierId,
    address: addressId,
    items,
    totalAmount,
    commissionAmount,
    supplierEarning,
    paymentMethod
  });

  await Cart.deleteOne({ user: req.userId });

  res.status(201).json(order);
});

router.put("/:orderId/cancel", userAuth, async (req: UserRequest, res) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    user: req.userId
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.orderStatus !== "PLACED") {
    return res
      .status(400)
      .json({ message: "Order cannot be cancelled now" });
  }

  order.orderStatus = "CANCELLED";
  await order.save();

  res.json({ message: "Order cancelled", order });
});

export default router;