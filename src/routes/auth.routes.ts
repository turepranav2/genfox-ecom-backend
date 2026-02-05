import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User Auth
 */

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;