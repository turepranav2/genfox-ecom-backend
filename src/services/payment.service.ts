import Payment from "../models/Payment";

export const createPayment = async (
  orderId: string,
  method: "COD" | "ONLINE",
  amount: number
) => {
  return Payment.create({
    order: orderId,
    method,
    amount,
    status: method === "COD" ? "SUCCESS" : "INITIATED"
  });
};

export const updatePaymentStatus = async (
  orderId: string,
  status: "SUCCESS" | "FAILED"
) => {
  return Payment.findOneAndUpdate(
    { order: orderId },
    { status },
    { new: true }
  );
};