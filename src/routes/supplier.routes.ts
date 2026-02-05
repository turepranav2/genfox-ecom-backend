import express from "express";
import Supplier from "../models/Supplier";
import { adminAuth } from "../middleware/adminAuth.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Supplier
 *   description: Supplier management APIs
 */

/**
 * @swagger
 * /api/supplier:
 *   post:
 *     summary: Register supplier
 *     tags: [Supplier]
 */
router.post("/", async (req, res) => {
  const supplier = await Supplier.create(req.body);
  res.status(201).json(supplier);
});

/**
 * @swagger
 * /api/supplier:
 *   get:
 *     summary: Get all suppliers
 *     tags: [Supplier]
 */
router.get("/", async (_req, res) => {
  const suppliers = await Supplier.find();
  res.json(suppliers);
});

/**
 * @swagger
 * /api/supplier/{id}/approve:
 *   put:
 *     summary: Approve supplier
 *     tags: [Supplier]
 */
router.put("/:id/approve", adminAuth, async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(
    req.params.id,
    { status: "APPROVED" },
    { new: true }
  );
  res.json(supplier);
});

/**
 * @swagger
 * /api/supplier/{id}/reject:
 *   put:
 *     summary: Reject supplier
 *     tags: [Supplier]
 */
router.put("/:id/reject", adminAuth, async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(
    req.params.id,
    { status: "REJECTED" },
    { new: true }
  );
  res.json(supplier);
});

export default router;