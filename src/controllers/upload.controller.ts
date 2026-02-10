import { Request, Response } from "express";

export const uploadImage = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file provided" });
  }

  // multer-storage-cloudinary puts the URL in req.file.path
  res.json({ url: (req.file as any).path });
};
