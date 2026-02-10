import Cart from "../models/Cart";
import Product from "../models/Product";
import { Types } from "mongoose";

/* ---------- TYPES ---------- */
interface CartItem {
  productId: Types.ObjectId;
  quantity: number;
}

/* ---------- GET CART ---------- */
export const getCartService = async (userId: string) => {
  return Cart.findOne({ userId }).populate(
    "items.productId",
    "name price images stock"
  );
};

/* ---------- ADD TO CART ---------- */
export const addToCartService = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({
      userId: new Types.ObjectId(userId),
      items: [{ productId: product._id, quantity }]
    });
    return Cart.findById(cart._id).populate(
      "items.productId",
      "name price images stock"
    );
  }

  const itemIndex = cart.items.findIndex(
    (item: CartItem) => item.productId.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({
      productId: product._id,
      quantity
    });
  }

  await cart.save();
  return Cart.findById(cart._id).populate(
    "items.productId",
    "name price images stock"
  );
};

/* ---------- UPDATE QUANTITY ---------- */
export const updateCartItemService = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) return null;

  const item = cart.items.find(
    (i: CartItem) => i.productId.toString() === productId
  );

  if (!item) return null;

  item.quantity = quantity;
  await cart.save();
  return Cart.findById(cart._id).populate(
    "items.productId",
    "name price images stock"
  );
};

/* ---------- REMOVE ITEM ---------- */
export const removeCartItemService = async (
  userId: string,
  productId: string
) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) return null;

  cart.items = cart.items.filter(
    (i: CartItem) => i.productId.toString() !== productId
  );

  await cart.save();
  return Cart.findById(cart._id).populate(
    "items.productId",
    "name price images stock"
  );
};

/* ---------- CLEAR CART ---------- */
export const clearCartService = async (userId: string) => {
  return Cart.findOneAndUpdate({ userId }, { items: [] }, { new: true });
};