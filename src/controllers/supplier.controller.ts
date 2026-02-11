import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Supplier from "../models/Supplier";
import Order from "../models/Order";
import { env } from "../config/env";
import { SupplierRequest } from "../middleware/supplierAuth.middleware";

export const registerSupplier = async (req: Request, res: Response) => {
  if (!req.body) {
    return res.status(400).json({ message: "Request body missing" });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const existing = await Supplier.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Supplier already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await Supplier.create({
    name,
    email,
    password: hashedPassword,
    status: "APPROVED"
  });

  res.status(201).json({
    message: "Supplier registered successfully! You can now login."
  });
};

export const loginSupplier = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required" });
  }

  const supplier = await Supplier.findOne({ email });
  if (!supplier) {
    return res.status(404).json({ message: "Invalid credentials" });
  }

  if (supplier.status === "REJECTED") {
    return res.status(403).json({ message: "Supplier account has been revoked. Contact admin." });
  }

  const isMatch = await bcrypt.compare(password, supplier.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ supplierId: supplier._id }, env.JWT_SECRET, {
    expiresIn: "7d"
  });

  res.json({ token });
};

/* ────────── SUPPLIER PROFILE ────────── */

export const getSupplierProfile = async (
  req: SupplierRequest,
  res: Response
) => {
  const supplier = await Supplier.findById(req.supplierId).select(
    "-password"
  );
  if (!supplier) {
    return res.status(404).json({ message: "Supplier not found" });
  }
  res.json({ supplier });
};

export const updateSupplierProfile = async (
  req: SupplierRequest,
  res: Response
) => {
  const { name, phone, gstin, address, bankDetails } = req.body;

  const supplier: any = await Supplier.findById(req.supplierId);
  if (!supplier) {
    return res.status(404).json({ message: "Supplier not found" });
  }

  // Email and status are NOT updatable via profile
  if (name !== undefined) supplier.name = name;
  if (phone !== undefined) supplier.phone = phone;
  if (gstin !== undefined) supplier.gstin = gstin;
  if (address !== undefined) supplier.address = address;
  if (bankDetails !== undefined) supplier.bankDetails = bankDetails;

  await supplier.save();

  const updated = await Supplier.findById(req.supplierId).select(
    "-password"
  );
  res.json({ supplier: updated });
};

/* ────────── SUPPLIER PAYMENTS ────────── */

export const getPaymentSummary = async (
  req: SupplierRequest,
  res: Response
) => {
  const supplierId = req.supplierId!;
  const orders = await Order.find({ "items.supplierId": supplierId });

  let totalRevenue = 0;
  let pendingRevenue = 0;

  for (const order of orders) {
    let supplierTotal = 0;
    for (const item of order.items as any[]) {
      if (item.supplierId?.toString() === supplierId) {
        supplierTotal += item.price * item.quantity;
      }
    }
    totalRevenue += supplierTotal;
    if (order.status !== "DELIVERED") {
      pendingRevenue += supplierTotal;
    }
  }

  const commissionRate = 10; // 10% platform commission
  const totalCommission = totalRevenue * (commissionRate / 100);
  const netPayout = totalRevenue - totalCommission;
  const pendingPayout = pendingRevenue * ((100 - commissionRate) / 100);

  res.json({
    totalRevenue,
    totalCommission,
    netPayout,
    pendingPayout
  });
};

export const getPaymentTransactions = async (
  req: SupplierRequest,
  res: Response
) => {
  const supplierId = req.supplierId!;
  const orders = await Order.find({
    "items.supplierId": supplierId,
    status: { $in: ["DELIVERED", "SHIPPED", "PROCESSING"] }
  }).sort({ createdAt: -1 });

  // Derive transactions from orders
  const transactions = orders.map((order: any) => {
    let supplierAmount = 0;
    for (const item of order.items) {
      if (item.supplierId?.toString() === supplierId) {
        supplierAmount += item.price * item.quantity;
      }
    }
    return {
      _id: order._id,
      id: order._id.toString(),
      type: "ORDER_PAYMENT",
      amount: supplierAmount,
      status: order.status === "DELIVERED" ? "COMPLETED" : "PENDING",
      orderId: order._id,
      createdAt: order.createdAt
    };
  });

  res.json(transactions);
};