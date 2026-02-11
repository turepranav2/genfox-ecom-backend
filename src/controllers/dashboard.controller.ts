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
    pendingSuppliers,
    totalProducts,
    pendingProducts,
    totalOrders
  ] = await Promise.all([
    User.countDocuments(),
    Supplier.countDocuments(),
    Supplier.countDocuments({ status: "PENDING" }),
    Product.countDocuments(),
    Product.countDocuments({ approvalStatus: "PENDING" }),
    Order.countDocuments()
  ]);

  const revenueAgg = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$total" },
        totalCommission: { $sum: "$commission" }
      }
    }
  ]);

  const totalRevenue =
    revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;
  const totalCommission =
    revenueAgg.length > 0 ? revenueAgg[0].totalCommission : 0;

  const recentOrders = await Order.find()
    .populate("userId", "name email phone")
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    totalUsers,
    totalSuppliers,
    pendingSuppliers,
    totalProducts,
    pendingProducts,
    totalOrders,
    totalRevenue,
    totalCommission,
    recentOrders
  });
};

/* ================= SUPPLIER DASHBOARD ================= */
export const getSupplierDashboardMetrics = async (
  req: Request & { supplierId?: string },
  res: Response
) => {
  const supplierId = req.supplierId;

  const productsCount = await Product.countDocuments({ supplierId });

  const orders = await Order.find({ "items.supplierId": supplierId })
    .populate("userId", "name email phone")
    .populate("items.productId", "name price images")
    .sort({ createdAt: -1 });

  // Calculate revenue from this supplier's items
  let revenue = 0;
  for (const order of orders) {
    for (const item of order.items as any[]) {
      if (item.supplierId?.toString() === supplierId) {
        revenue += item.price * item.quantity;
      }
    }
  }

  const commissionPaid = revenue * 0.1; // 10% platform commission

  res.json({
    productsCount,
    ordersCount: orders.length,
    revenue,
    commissionPaid,
    recentOrders: orders.slice(0, 5)
  });
};