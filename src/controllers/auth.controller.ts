import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { env } from "../config/env";
import { UserRequest } from "../middleware/userAuth.middleware";

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    phone: phone || "",
    password: hashedPassword,
    role: "USER"
  });

  res.status(201).json({ message: "User registered successfully" });
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, {
    expiresIn: "7d"
  });

  res.json({ token });
};

export const getProfile = async (req: UserRequest, res: Response) => {
  const user = await User.findById(req.userId).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ user });
};

export const updateProfile = async (req: UserRequest, res: Response) => {
  const { name, phone, addresses } = req.body;

  const user: any = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Email and role are NOT updatable
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (addresses !== undefined) user.addresses = addresses;

  await user.save();

  const updated = await User.findById(req.userId).select("-password");
  res.json({ user: updated });
};
