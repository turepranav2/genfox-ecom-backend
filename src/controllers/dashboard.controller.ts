import { Request, Response } from "express";
import User from "../models/User";
import Supplier from "../models/Supplier";
import Product from "../models/Product";
import Order from "../models/Order";

/* ================= ADMIN DASHBOARD ================= */
export const getAdminDashboardMetrics = async (
  _req: Request,
  res: Response
) => {
  const [
    totalUsers,
    totalSuppliers,
    approvedSuppliers,
    pendingSuppliers,
    totalProducts,
    orders
  ] = await Promise.all([
    User.countDocuments(),
    Supplier.countDocuments(),
    Supplier.countDocuments({ status: "APPROVED" }),
    Supplier.countDocuments({ status: "PENDING" }),
    Product.countDocuments(),
    Order.find()
  ]);

  const totalRevenue = orders.reduce(
    (sum: number, o: any) => sum + o.totalAmount,
    0
  );

  const totalCommission = orders.reduce(
    (sum: number, o: any) => sum + (o.commissionAmount || 0),
    0
  );

  res.json({
    totalUsers,
    totalSuppliers,
    approvedSuppliers,
    pendingSuppliers,
    totalProducts,
    totalOrders: orders.length,
    totalRevenue,
    totalCommission
  });
};

/* ================= SUPPLIER DASHBOARD ================= */
export const getSupplierDashboardMetrics = async (
  req: Request & { supplierId?: string },
  res: Response
) => {
  const supplierId = req.supplierId;

  const [products, orders] = await Promise.all([
    Product.find({ supplier: supplierId }),
    Order.find({ supplier: supplierId }).sort({ createdAt: -1 })
  ]);

  const revenue = orders.reduce(
    (sum: number, o: any) => sum + o.supplierEarning,
    0
  );

  const commissionPaid = orders.reduce(
    (sum: number, o: any) => sum + o.commissionAmount,
    0
  );

  res.json({
    productsCount: products.length,
    ordersCount: orders.length,
    revenue,
    commissionPaid,
    recentOrders: orders.slice(0, 5)
  });
};