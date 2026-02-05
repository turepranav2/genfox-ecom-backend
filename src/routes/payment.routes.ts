import express from "express";
import { userAuth } from "../middleware/userAuth.middleware";
import {
  getUserPayments,
  confirmOnlinePayment
} from "../controllers/payment.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 */

router.get("/", userAuth, getUserPayments);
router.post("/confirm", userAuth, confirmOnlinePayment);

export default router;