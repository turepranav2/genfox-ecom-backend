import express from "express";
import { userAuth } from "../middleware/userAuth.middleware";
import {
  addAddress,
  getAddresses
} from "../controllers/address.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Address
 */

router.post("/", userAuth, addAddress);
router.get("/", userAuth, getAddresses);

export default router;