import { Router } from "express";
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  getFollowingPosts,
  getLikedPost,
  getMyPost,
  getUserPost,
  likeUnlikePost,
} from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

export const postRoutes = Router();

postRoutes.post("/create", protectRoute, createPost);
postRoutes.get("/me", protectRoute, getMyPost);
postRoutes.get("/user/:username", protectRoute, getUserPost);
postRoutes.get("/all", protectRoute, getAllPosts);
postRoutes.delete("/:postId", protectRoute, deletePost);

postRoutes.post("/like/:postId", protectRoute, likeUnlikePost);
postRoutes.get("/likes/:userId", protectRoute, getLikedPost);

postRoutes.post("/comment/:postId", protectRoute, commentOnPost);

postRoutes.get("/following", protectRoute, getFollowingPosts);
