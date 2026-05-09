import { Router } from "express";
import { getUserProfile } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

export const userRoutes = Router();

userRoutes.get("/profile/:username", protectRoute, getUserProfile);
