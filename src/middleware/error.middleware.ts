import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("❌ ERROR:", err.message);

  const statusCode = (err as any).statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({ message });
};