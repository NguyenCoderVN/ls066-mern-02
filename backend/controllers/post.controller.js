import postService from "../services/post.service.js";
import { catchAsync } from "../utils/catchAsync.js";

export const createPost = catchAsync(async (req, res) => {
  const post = await postService.createPost(req.user._id, req.body);
  res.status(201).json({ status: "success", data: post });
});

export const getMyPosts = catchAsync(async (req, res, next) => {
  const posts = await postService.getUserPostsById(req.user._id);

  res.status(200).json({
    status: "success",
    data: posts,
  });
});

export const getAllPosts = catchAsync(async (req, res) => {
  const posts = await postService.getAllPosts();
  res.status(200).json({ status: "success", data: posts });
});

export const getUserPosts = catchAsync(async (req, res) => {
  const posts = await postService.getUserPosts(req.params.username);
  res.status(200).json({ status: "success", data: posts });
});

export const getFollowingPosts = catchAsync(async (req, res) => {
  const posts = await postService.getFollowingPosts(req.user._id);
  res.status(200).json({ status: "success", data: posts });
});

export const getLikedPosts = catchAsync(async (req, res) => {
  const posts = await postService.getLikedPosts(req.params.userId);
  res.status(200).json({ status: "success", data: posts });
});

export const deletePost = catchAsync(async (req, res) => {
  await postService.deletePost(req.params.postId, req.user._id);
  res
    .status(200)
    .json({ status: "success", message: "Post deleted" });
});

export const likeUnlikePost = catchAsync(async (req, res) => {
  const { isLiked, post } = await postService.toggleLikePost(
    req.params.postId,
    req.user._id,
  );
  res.status(200).json({
    status: "success",
    message: `Post ${isLiked ? "liked" : "unliked"}`,
    data: post,
  });
});

export const commentOnPost = catchAsync(async (req, res) => {
  const post = await postService.commentOnPost(
    req.params.postId,
    req.user._id,
    req.body.text,
  );
  res.status(200).json({ status: "success", data: post });
});
