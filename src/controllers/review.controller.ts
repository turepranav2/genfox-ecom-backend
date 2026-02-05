import { Response } from "express";
import { UserRequest } from "../middleware/userAuth.middleware";
import Review from "../models/Review";
import Order from "../models/Order";

export const addReview = async (req: UserRequest, res: Response) => {
  const { productId, comment } = req.body;

  // Verify user has purchased this product
  const order = await Order.findOne({
    user: req.userId,
    "items.product": productId,
    orderStatus: "DELIVERED"
  });

  if (!order) {
    return res
      .status(403)
      .json({ message: "Review allowed only after purchase" });
  }

  const existingReview = await Review.findOne({
    user: req.userId,
    product: productId
  });

  if (existingReview) {
    return res.status(400).json({ message: "Review already submitted" });
  }

  const review = await Review.create({
    user: req.userId,
    product: productId,
    comment
  });

  res.status(201).json(review);
};

export const getProductReviews = async (req: any, res: Response) => {
  const reviews = await Review.find({
    product: req.params.productId
  }).populate("user", "name");

  res.json(reviews);
};