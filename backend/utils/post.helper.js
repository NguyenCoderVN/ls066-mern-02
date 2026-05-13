import { Post } from "../../models/post.model.js";

export const getPostsAndResponse = async (res, filter = {}) => {
  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .populate({ path: "userId", select: "-password" })
    .populate({ path: "comments.user", select: "-password" });

  if (!posts || posts.length === 0) {
    return res.status(404).json({ error: "No posts found" });
  }

  return res.status(200).json(posts);
};
