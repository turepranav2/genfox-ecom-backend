import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Supplier from "../models/Supplier";
import { env } from "../config/env";

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
    status: "PENDING"
  });

  res.status(201).json({
    message: "Supplier registered. Awaiting admin approval."
  });
};

export const loginSupplier = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const supplier = await Supplier.findOne({ email });
  if (!supplier) {
    return res.status(404).json({ message: "Invalid credentials" });
  }

  if (supplier.status !== "APPROVED") {
    return res.status(403).json({ message: "Supplier not approved" });
  }

  const isMatch = await bcrypt.compare(password, supplier.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { supplierId: supplier._id },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
};