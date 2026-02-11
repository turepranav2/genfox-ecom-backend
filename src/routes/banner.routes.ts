import express from "express";
import {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners
} from "../controllers/banner.controller";
import { adminAuth } from "../middleware/adminAuth.middleware";

const router = express.Router();

/* PUBLIC */
router.get("/", getActiveBanners);

/* ADMIN — reorder must be before /:id to avoid "reorder" being treated as an ID */
router.get("/admin", adminAuth, getAllBanners);
router.put("/admin/reorder", adminAuth, reorderBanners);
router.post("/admin", adminAuth, createBanner);
router.put("/admin/:id", adminAuth, updateBanner);
router.delete("/admin/:id", adminAuth, deleteBanner);

export default router;
