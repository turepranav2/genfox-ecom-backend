import Cart from "../models/Cart";
import Product from "../models/Product";
import { Types } from "mongoose";

/* ---------- TYPES ---------- */
interface CartItem {
  product: Types.ObjectId;
  quantity: number;
}

/* ---------- GET CART ---------- */
export const getCartService = async (userId: string) => {
  return Cart.findOne({ user: userId }).populate("items.product");
};

/* ---------- ADD TO CART ---------- */
export const addToCartService = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: new Types.ObjectId(userId),
      items: [{ product: product._id, quantity }]
    });
    return cart;
  }

  const itemIndex = cart.items.findIndex(
    (item: CartItem) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({
      product: product._id,
      quantity
    });
  }

  await cart.save();
  return cart;
};

/* ---------- UPDATE QUANTITY ---------- */
export const updateCartItemService = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return null;

  const item = cart.items.find(
    (i: CartItem) => i.product.toString() === productId
  );

  if (!item) return null;

  item.quantity = quantity;
  await cart.save();
  return cart;
};

/* ---------- REMOVE ITEM ---------- */
export const removeCartItemService = async (
  userId: string,
  productId: string
) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return null;

  cart.items = cart.items.filter(
    (i: CartItem) => i.product.toString() !== productId
  );

  await cart.save();
  return cart;
};

/* ---------- CLEAR CART ---------- */
export const clearCartService = async (userId: string) => {
  return Cart.findOneAndUpdate(
    { user: userId },
    { items: [] },
    { new: true }
  );
};