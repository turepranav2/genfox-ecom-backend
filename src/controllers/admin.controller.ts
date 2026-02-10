import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import User from "../models/User";
import Order from "../models/Order";
import Supplier from "../models/Supplier";
import Product from "../models/Product";

export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  if (email !== env.ADMIN_EMAIL || password !== env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  const token = jwt.sign({ role: "ADMIN" }, env.JWT_SECRET, {
    expiresIn: "1d"
  });

  res.json({ token });
};

/* GET ALL USERS */
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    const usersWithCounts = await Promise.all(
      users.map(async (user: any) => {
        const orderCount = await Order.countDocuments({ userId: user._id });
        return { ...user.toJSON(), orderCount };
      })
    );

    res.json(usersWithCounts);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* DELETE USER */
export const deleteUser = async (req: Request, res: Response) => {
  const userId =
    typeof req.params.id === "string" ? req.params.id : req.params.id[0];

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Cancel pending orders
  await Order.updateMany(
    { userId, status: { $in: ["PENDING", "PROCESSING"] } },
    { status: "CANCELLED" }
  );

  await User.findByIdAndDelete(userId);

  res.json({ message: "User deleted successfully" });
};

/* GET ALL SUPPLIERS (with product counts) */
export const getAllSuppliers = async (_req: Request, res: Response) => {
  try {
    const suppliers = await Supplier.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    const suppliersWithCounts = await Promise.all(
      suppliers.map(async (supplier: any) => {
        const productCount = await Product.countDocuments({
          supplierId: supplier._id
        });
        return { ...supplier.toJSON(), productCount };
      })
    );

    res.json(suppliersWithCounts);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch suppliers" });
  }
};

/* APPROVE SUPPLIER */
export const approveSupplier = async (req: Request, res: Response) => {
  const id =
    typeof req.params.id === "string" ? req.params.id : req.params.id[0];
  const supplier = await Supplier.findByIdAndUpdate(
    id,
    { status: "APPROVED" },
    { new: true }
  ).select("-password");

  if (!supplier) {
    return res.status(404).json({ message: "Supplier not found" });
  }
  res.json({ supplier, message: "Supplier approved" });
};

/* REJECT SUPPLIER */
export const rejectSupplier = async (req: Request, res: Response) => {
  const id =
    typeof req.params.id === "string" ? req.params.id : req.params.id[0];
  const supplier = await Supplier.findByIdAndUpdate(
    id,
    { status: "REJECTED" },
    { new: true }
  ).select("-password");

  if (!supplier) {
    return res.status(404).json({ message: "Supplier not found" });
  }
  res.json({ supplier, message: "Supplier rejected" });
};