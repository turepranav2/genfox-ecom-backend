import express from "express";
import Enquiry from "../models/Enquiry";
import { userAuth, UserRequest } from "../middleware/userAuth.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Enquiry
 *   description: User enquiry APIs
 */

/**
 * @swagger
 * /api/enquiry:
 *   post:
 *     summary: Create enquiry
 *     tags: [Enquiry]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", userAuth, async (req: UserRequest, res) => {
  const enquiry = await Enquiry.create({
    user: req.userId,
    message: req.body.message
  });
  res.status(201).json(enquiry);
});

/**
 * @swagger
 * /api/enquiry:
 *   get:
 *     summary: Get all enquiries
 *     tags: [Enquiry]
 */
router.get("/", async (_req, res) => {
  const enquiries = await Enquiry.find().populate("user");
  res.json(enquiries);
});

/**
 * @swagger
 * /api/enquiry/{id}:
 *   delete:
 *     summary: Delete enquiry
 *     tags: [Enquiry]
 */
router.delete("/:id", async (req, res) => {
  await Enquiry.findByIdAndDelete(req.params.id);
  res.json({ message: "Enquiry deleted" });
});

export default router;