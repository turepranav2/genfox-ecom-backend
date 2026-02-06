import express from "express";
import { adminAuth } from "../middleware/adminAuth.middleware";
import Supplier from "../models/Supplier";
import { adminLogin } from "../controllers/admin.controller";

const router = express.Router();

router.post("/login", adminLogin);

router.get("/suppliers", adminAuth, async (_req, res) => {
  const suppliers = await Supplier.find();
  res.json(suppliers);
});

router.put("/suppliers/:id/approve", adminAuth, async (req, res) => {
  await Supplier.findByIdAndUpdate(req.params.id, { status: "APPROVED" });
  res.json({ message: "Supplier approved" });
});

router.put("/suppliers/:id/reject", adminAuth, async (req, res) => {
  await Supplier.findByIdAndUpdate(req.params.id, { status: "REJECTED" });
  res.json({ message: "Supplier rejected" });
});

export default router;