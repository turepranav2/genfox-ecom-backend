import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export const adminAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.headers;

  if (
    email === env.ADMIN_EMAIL &&
    password === env.ADMIN_PASSWORD
  ) {
    return next();
  }

  return res.status(403).json({ message: "Admin access denied" });
};