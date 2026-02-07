import express from "express";
import Supplier from "../models/Supplier";
import { adminAuth } from "../middleware/adminAuth.middleware";

const router = express.Router();

/* ADMIN ONLY */
router.get("/", adminAuth, async (_req, res) => {
  const suppliers = await Supplier.find();
  res.json(suppliers);
});

router.put("/:id/approve", adminAuth, async (req, res) => {
  await Supplier.findByIdAndUpdate(req.params.id, { status: "APPROVED" });
  res.json({ message: "Supplier approved" });
});

router.put("/:id/reject", adminAuth, async (req, res) => {
  await Supplier.findByIdAndUpdate(req.params.id, { status: "REJECTED" });
  res.json({ message: "Supplier rejected" });
});

export default router;