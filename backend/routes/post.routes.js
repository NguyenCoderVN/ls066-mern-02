import { Router } from "express";
import {
  createPost,
  deletePost,
} from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

export const postRoutes = Router();

postRoutes.post("/create", protectRoute, createPost);
postRoutes.post("/delete/:id", protectRoute, deletePost);
