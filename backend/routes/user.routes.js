import { Router } from "express";
import {
  followUnfollowUser,
  getUserProfile,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

export const userRoutes = Router();

userRoutes.get("/profile/:username", protectRoute, getUserProfile);
userRoutes.post(
  "/follow/:followerId",
  protectRoute,
  followUnfollowUser,
);
