import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from "../controllers/cart.controller";
import { userAuth } from "../middleware/userAuth.middleware";

const router = express.Router();

router.get("/", userAuth, getCart);
router.post("/add", userAuth, addToCart);
router.put("/update/:productId", userAuth, updateCartItem);
router.delete("/remove/:productId", userAuth, removeCartItem);
router.delete("/clear", userAuth, clearCart);

export default router;