import { Post } from "../models/post.model.js";
import { findEntityOrThrow } from "../lib/utils/repo.helper.js";

export const findPostByIdOrThrow = (postId) =>
  findEntityOrThrow(Post, { _id: postId }, "Post");

export const deletePostById = async (postId) => {
  return await Post.findByIdAndDelete(postId);
};
