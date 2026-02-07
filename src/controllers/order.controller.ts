import { Request, Response } from "express";
import {
  createOrderService,
  getUserOrdersService,
  getSupplierOrdersService,
  getAllOrdersService,
  updateOrderStatusService
} from "../services/order.service";
import { UserRequest } from "../middleware/userAuth.middleware";
import { SupplierRequest } from "../middleware/supplierAuth.middleware";
import { ORDER_STATUSES } from "../constants/orderStatus";

/* USER: PLACE ORDER */
export const createOrder = async (req: UserRequest, res: Response) => {
  const { items, address } = req.body;

  if (!items?.length || !address) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  const order = await createOrderService(
    req.userId!,
    items,
    address
  );

  res.status(201).json(order);
};

/* USER: GET OWN ORDERS */
export const getUserOrders = async (req: UserRequest, res: Response) => {
  const orders = await getUserOrdersService(req.userId!);
  res.json(orders);
};

/* SUPPLIER: GET ORDERS */
export const getSupplierOrders = async (
  req: SupplierRequest,
  res: Response
) => {
  const orders = await getSupplierOrdersService(req.supplierId!);
  res.json(orders);
};

/* ADMIN: GET ALL ORDERS */
export const getAllOrders = async (_req: Request, res: Response) => {
  const orders = await getAllOrdersService();
  res.json(orders);
};

/* ADMIN: UPDATE ORDER STATUS */
export const updateOrderStatus = async (req: Request, res: Response) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  // ✅ Normalize param to string (Type-safe)
  const orderId =
    typeof req.params.id === "string"
      ? req.params.id
      : req.params.id[0];

  const order = await updateOrderStatusService(orderId, status);

  if (!ORDER_STATUSES.includes(status)) {
  return res.status(400).json({ message: "Invalid order status" });
  }

  res.json(order);
};
