import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile
} from "../controllers/auth.controller";
import { userAuth } from "../middleware/userAuth.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User Auth
 */

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", userAuth, getProfile);
router.put("/profile", userAuth, updateProfile);

export default router;