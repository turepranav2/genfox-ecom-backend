import { Response } from "express";
import { UserRequest } from "../middleware/userAuth.middleware";
import Payment from "../models/Payment";
import Order from "../models/Order";
import { createPayment, updatePaymentStatus } from "../services/payment.service";

export const getUserPayments = async (
  req: UserRequest,
  res: Response
) => {
  const payments = await Payment.find()
    .populate({
      path: "order",
      match: { user: req.userId }
    });

  res.json(payments.filter(Boolean));
};

export const confirmOnlinePayment = async (
  req: UserRequest,
  res: Response
) => {
  const { orderId, status } = req.body;

  const payment = await updatePaymentStatus(orderId, status);
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  if (status === "SUCCESS") {
    await Order.findByIdAndUpdate(orderId, {
      orderStatus: "PAID"
    });
  }

  res.json(payment);
};