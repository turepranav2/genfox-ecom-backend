import express from "express";
import {
  registerSupplier,
  loginSupplier
} from "../controllers/supplier.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Supplier Auth
 */

router.post("/register", registerSupplier);
router.post("/login", loginSupplier);

export default router;