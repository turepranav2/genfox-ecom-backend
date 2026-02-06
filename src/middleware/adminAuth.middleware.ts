import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const adminAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized admin" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      role: string;
    };

    if (decoded.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch {
    return res.status(401).json({ message: "Invalid admin token" });
  }
};