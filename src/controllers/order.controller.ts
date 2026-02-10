import { Request, Response } from "express";
import {
  createOrderService,
  getUserOrdersService,
  getSupplierOrdersService,
  getAllOrdersService,
  updateOrderStatusService,
  supplierUpdateStatusService,
  supplierDeliverService,
  userConfirmReceiptService
} from "../services/order.service";
import { UserRequest } from "../middleware/userAuth.middleware";
import { SupplierRequest } from "../middleware/supplierAuth.middleware";

/* USER: PLACE ORDER */
export const createOrder = async (req: UserRequest, res: Response) => {
  try {
    const { items, address } = req.body;

    if (!items?.length || !address) {
      return res
        .status(400)
        .json({ message: "Items and address are required" });
    }

    const order = await createOrderService(req.userId!, items, address);
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/* USER: GET OWN ORDERS */
export const getUserOrders = async (req: UserRequest, res: Response) => {
  const orders = await getUserOrdersService(req.userId!);
  res.json(orders);
};

/* USER: CONFIRM RECEIPT */
export const confirmReceipt = async (req: UserRequest, res: Response) => {
  try {
    const orderId =
      typeof req.params.id === "string" ? req.params.id : req.params.id[0];
    const order = await userConfirmReceiptService(orderId, req.userId!);
    res.json(order);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/* SUPPLIER: GET ORDERS */
export const getSupplierOrders = async (
  req: SupplierRequest,
  res: Response
) => {
  const orders = await getSupplierOrdersService(req.supplierId!);
  res.json(orders);
};

/* SUPPLIER: UPDATE ORDER STATUS */
export const supplierUpdateStatus = async (
  req: SupplierRequest,
  res: Response
) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const orderId =
      typeof req.params.id === "string" ? req.params.id : req.params.id[0];
    const order = await supplierUpdateStatusService(
      orderId,
      req.supplierId!,
      status
    );
    res.json(order);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/* SUPPLIER: CONFIRM DELIVERY */
export const supplierDeliver = async (
  req: SupplierRequest,
  res: Response
) => {
  try {
    const { cashCollected, supplierConfirmed } = req.body;
    const orderId =
      typeof req.params.id === "string" ? req.params.id : req.params.id[0];
    const order = await supplierDeliverService(
      orderId,
      req.supplierId!,
      cashCollected,
      supplierConfirmed
    );
    res.json(order);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/* ADMIN: GET ALL ORDERS */
export const getAllOrders = async (_req: Request, res: Response) => {
  const orders = await getAllOrdersService();
  res.json(orders);
};

/* ADMIN: UPDATE ORDER STATUS (legacy — kept for emergency use) */
export const updateOrderStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }
  const orderId =
    typeof req.params.id === "string" ? req.params.id : req.params.id[0];
  const order = await updateOrderStatusService(orderId, status);
  res.json(order);
};
