import { Request, Response } from "express";
import Product from "../models/Product";
import Category from "../models/Category";

export const createProduct = async (req: Request, res: Response) => {
  const supplierId = (req as any).supplierId;

  const {
    name,
    slug,
    description,
    price,
    stock,
    category,
    brand,
    tags,
    attributes
  } = req.body;

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return res.status(404).json({ message: "Category not found" });
  }

  const files = req.files as Express.Multer.File[] | undefined;
  const images = files?.map((file) => file.path);

  const product = await Product.create({
    name,
    slug,
    description,
    price,
    stock,
    brand,
    category,
    supplier: supplierId,
    tags,
    attributes,
    images
  });

  res.status(201).json(product);
};