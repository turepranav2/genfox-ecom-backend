import { Response } from "express";
import {
  getCartService,
  addToCartService,
  updateCartItemService,
  removeCartItemService,
  clearCartService
} from "../services/cart.service";
import { UserRequest } from "../middleware/userAuth.middleware";

/* GET CART */
export const getCart = async (req: UserRequest, res: Response) => {
  const cart = await getCartService(req.userId!);
  res.json(cart || { items: [], total: 0 });
};

/* ADD ITEM */
export const addToCart = async (req: UserRequest, res: Response) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: "productId and quantity are required" });
    }

    const cart = await addToCartService(req.userId!, productId, quantity);
    res.json(cart);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/* UPDATE ITEM (productId from body) */
export const updateCartItem = async (req: UserRequest, res: Response) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res
      .status(400)
      .json({ message: "productId and quantity required" });
  }

  const cart = await updateCartItemService(req.userId!, productId, quantity);

  if (!cart) {
    return res.status(404).json({ message: "Item not found" });
  }

  res.json(cart);
};

/* REMOVE ITEM */
export const removeCartItem = async (req: UserRequest, res: Response) => {
  const productId =
    typeof req.params.productId === "string"
      ? req.params.productId
      : req.params.productId[0];

  const cart = await removeCartItemService(req.userId!, productId);

  if (!cart) {
    return res.status(404).json({ message: "Item not found" });
  }

  res.json(cart);
};

/* CLEAR CART */
export const clearCart = async (req: UserRequest, res: Response) => {
  const cart = await clearCartService(req.userId!);
  res.json(cart || { items: [], message: "Cart cleared" });
};