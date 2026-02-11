import express from "express";
import { getActiveBanners } from "../controllers/banner.controller";

const router = express.Router();

/* PUBLIC */
router.get("/", getActiveBanners);

export default router;
