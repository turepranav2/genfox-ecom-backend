import express from "express";
import { supplierAuth } from "../middleware/supplierAuth.middleware";
import { upload } from "../middleware/upload.middleware";
import { createProduct } from "../controllers/product.controller";
import Product from "../models/Product";
import { searchProductController } from "../controllers/search.controller";
import { userAuth } from "../middleware/userAuth.middleware";
import {addReview,getProductReviews} from "../controllers/review.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 */

// Supplier: Add product
router.post(
  "/",
  supplierAuth,
  upload.array("images", 5),
  createProduct
);

// Public: Get products
router.get("/", async (_, res) => {
  const products = await Product.find({ isActive: true })
    .populate("category")
    .populate("supplier");

  res.json(products);
});

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products with filters
 *     tags: [Products]
 */
router.get("/search", searchProductController);

/**
 * @swagger
 * /api/products/{productId}/reviews:
 *   post:
 *     summary: Add product review
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:productId/reviews", userAuth, addReview);

/**
 * @swagger
 * /api/products/{productId}/reviews:
 *   get:
 *     summary: Get product reviews
 *     tags: [Products]
 */
router.get("/:productId/reviews", getProductReviews);

export default router;