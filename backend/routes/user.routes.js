import { Router } from "express";
import {
  followUnfollowUser,
  getSuggestedUsers,
  getUserProfile,
  updateUser,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

export const userRoutes = Router();

userRoutes.get("/profile/:username", protectRoute, getUserProfile);
userRoutes.post("/update", protectRoute, updateUser);
userRoutes.post(
  "/follow/:followerUserId",
  protectRoute,
  followUnfollowUser,
);
userRoutes.get("/suggested", protectRoute, getSuggestedUsers);
