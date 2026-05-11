import { Router } from "express";
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  getLikedPost,
  likeUnlikePost,
} from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

export const postRoutes = Router();

postRoutes.post("/create", protectRoute, createPost);
postRoutes.post("/delete/:id", protectRoute, deletePost);
postRoutes.post("/comment/:id", protectRoute, commentOnPost);
postRoutes.post("/like/:postId", protectRoute, likeUnlikePost);
postRoutes.get("/all", protectRoute, getAllPosts);
postRoutes.get("/likes/:userId", protectRoute, getLikedPost);
