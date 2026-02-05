import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";


export interface SupplierRequest extends Request {
  supplierId?: string;
}

export const supplierAuth = (
  req: SupplierRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized supplier" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      supplierId: string;
    };

    req.supplierId = decoded.supplierId;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid supplier token" });
  }
};