import { Response } from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";
import { UserRequest } from "../middleware/userAuth.middleware";

export const getCart = async (req: UserRequest, res: Response) => {
  const cart = await Cart.findOne({ user: req.userId }).populate(
    "items.product"
  );
  res.json(cart || { items: [] });
};

export const addToCart = async (req: UserRequest, res: Response) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  let cart = await Cart.findOne({ user: req.userId });

  if (!cart) {
    cart = await Cart.create({
      user: req.userId,
      items: [{ product: productId, quantity }]
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
  }

  res.json(cart);
};

export const updateCartItem = async (req: UserRequest, res: Response) => {
  const { productId, quantity } = req.body;

  const cart = await Cart.findOne({ user: req.userId });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  cart.items = cart.items.map((item: any) =>
    item.product.toString() === productId
      ? { ...item.toObject(), quantity }
      : item
  );

  await cart.save();
  res.json(cart);
};

export const removeCartItem = async (req: UserRequest, res: Response) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.userId });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  cart.items = cart.items.filter(
    (item: any) => item.product.toString() !== productId
  );

  await cart.save();
  res.json(cart);
};