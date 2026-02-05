import { Request, Response } from "express";
import { searchProducts } from "../services/search.service";

export const searchProductController = async (
  req: Request,
  res: Response
) => {
  const products = await searchProducts(req.query);
  res.json(products);
};