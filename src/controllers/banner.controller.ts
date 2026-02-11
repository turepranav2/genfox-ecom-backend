import { Request, Response } from "express";
import Banner from "../models/Banner";

/* PUBLIC: GET ACTIVE BANNERS */
export const getActiveBanners = async (_req: Request, res: Response) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json(banners);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch banners" });
  }
};

/* ADMIN: GET ALL BANNERS */
export const getAllBanners = async (_req: Request, res: Response) => {
  try {
    const banners = await Banner.find({}).sort({ order: 1 });
    res.json(banners);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch banners" });
  }
};

/* ADMIN: CREATE BANNER */
export const createBanner = async (req: Request, res: Response) => {
  try {
    const { imageUrl, link, title, isActive, order } = req.body;

    if (!imageUrl || !link) {
      return res
        .status(400)
        .json({ message: "Image URL and link are required" });
    }

    const banner = await Banner.create({
      imageUrl,
      link,
      title: title || "",
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0
    });

    res.status(201).json({ banner });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/* ADMIN: UPDATE BANNER */
export const updateBanner = async (req: Request, res: Response) => {
  try {
    const id =
      typeof req.params.id === "string" ? req.params.id : req.params.id[0];
    const { imageUrl, link, title, isActive, order } = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    if (imageUrl !== undefined) banner.imageUrl = imageUrl;
    if (link !== undefined) banner.link = link;
    if (title !== undefined) banner.title = title;
    if (isActive !== undefined) banner.isActive = isActive;
    if (order !== undefined) banner.order = order;

    await banner.save();
    res.json({ banner });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/* ADMIN: DELETE BANNER */
export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const id =
      typeof req.params.id === "string" ? req.params.id : req.params.id[0];

    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    res.json({ message: "Banner deleted" });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to delete banner" });
  }
};

/* ADMIN: REORDER BANNERS */
export const reorderBanners = async (req: Request, res: Response) => {
  try {
    const { bannerIds } = req.body;

    if (!bannerIds || !Array.isArray(bannerIds)) {
      return res
        .status(400)
        .json({ message: "bannerIds array is required" });
    }

    for (let i = 0; i < bannerIds.length; i++) {
      await Banner.findByIdAndUpdate(bannerIds[i], { order: i });
    }

    res.json({ message: "Banners reordered" });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to reorder banners" });
  }
};
