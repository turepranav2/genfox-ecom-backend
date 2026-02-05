import express from "express";
import { userAuth } from "../middleware/userAuth.middleware";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem
} from "../controllers/cart.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 */

router.get("/", userAuth, getCart);
router.post("/add", userAuth, addToCart);
router.put("/update", userAuth, updateCartItem);
router.delete("/remove/:productId", userAuth, removeCartItem);

export default router;