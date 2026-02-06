import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (
    email !== env.ADMIN_EMAIL ||
    password !== env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  const token = jwt.sign(
    { role: "ADMIN" },
    env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    role: "ADMIN"
  });
};