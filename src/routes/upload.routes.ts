import express from "express";
import { upload } from "../middleware/upload.middleware";
import { uploadImage } from "../controllers/upload.controller";
import { anyAuth } from "../middleware/anyAuth.middleware";

const router = express.Router();

/**
 * POST /api/upload
 * Upload image to Cloudinary (any authenticated user/supplier/admin)
 * Field name: "image"
 * Returns: { url: "https://res.cloudinary.com/..." }
 */
router.post("/", anyAuth, upload.single("image"), uploadImage);

export default router;
