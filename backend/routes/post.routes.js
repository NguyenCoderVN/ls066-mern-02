import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import * as postCtrl from "../controllers/post.controller.js";

export const postRoutes = Router();

postRoutes.use(protectRoute);

postRoutes.route("/all").get(postCtrl.getAllPosts);
postRoutes.route("/me").get(postCtrl.getMyPosts);
postRoutes.route("/following").get(postCtrl.getFollowingPosts);
postRoutes.route("/create").post(postCtrl.createPost);

postRoutes
  .route("/:postId")
  .delete(postCtrl.deletePost)
  .post(postCtrl.commentOnPost);

postRoutes.get("/user/:username", postCtrl.getUserPosts);
postRoutes.post("/like/:postId", postCtrl.likeUnlikePost);
postRoutes.get("/likes/:userId", postCtrl.getLikedPosts);
postRoutes.post("/comment/:postId", postCtrl.commentOnPost);
