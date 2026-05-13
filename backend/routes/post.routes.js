import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getMyPosts,
  getUserPosts,
  likeUnlikePost,
} from "../controllers/post.controller.js";

export const postRoutes = Router();

postRoutes.post("/create", protectRoute, createPost);
postRoutes.get("/me", protectRoute, getMyPosts);
postRoutes.get("/user/:username", protectRoute, getUserPosts);
postRoutes.get("/all", protectRoute, getAllPosts);
postRoutes.delete("/:postId", protectRoute, deletePost);

postRoutes.post("/like/:postId", protectRoute, likeUnlikePost);
postRoutes.get("/likes/:userId", protectRoute, getLikedPosts);

postRoutes.post("/comment/:postId", protectRoute, commentOnPost);

postRoutes.get("/following", protectRoute, getFollowingPosts);
