import { handleError } from "../lib/utils/error.helper.js";
import { getPostsAndResponse } from "../lib/utils/post.helper.js";
import { Notification } from "../models/notification.model.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { text } = req.body;
    let { img } = req.body;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ error: "User not found" });

    if (!text && !img)
      return res.status(400).json({ error: "Provide text or image" });
    if (img) {
      const uploadResponse = await cloudinary.uploader.upload(img);
      img = uploadResponse.secure_url;
    }
    const newPost = new Post({
      userId,
      text,
      img,
    });
    await newPost.save();
    res.status(200).json(newPost);
  } catch (error) {
    return handleError(res, error, "createPost");
  }
};

export const getMyPost = async (req, res) => {
  try {
    await getPostsAndResponse(res, { userId: req.user._id });
  } catch (error) {
    return handleError(res, error, "getMyPost");
  }
};

export const getUserPost = async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    await getPostsAndResponse(res, { userId: user._id });
  } catch (error) {
    return handleError(res, error, "getUserPost");
  }
};

export const getAllPosts = async (req, res) => {
  try {
    await getPostsAndResponse(res);
  } catch (error) {
    return handleError(res, error, "getAllPosts");
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post)
      return res.status(404).json({ error: "Post not found" });

    if (!post.userId.equals(req.user._id))
      return res.status(401).json({ error: "Unauthorized" });

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return handleError(res, error, "deletePost");
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({ error: "Post not found" });

    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      post.likes.pull(userId);
      user.likedPosts.pull(postId);
    } else {
      post.likes.push(userId);
      user.likedPosts.push(postId);
      await new Notification({
        from: userId,
        to: post.userId,
        type: "like",
      }).save();
    }
    await post.save();
    await user.save();
    res.status(200).json({
      message: `Post ${isLiked ? "unliked" : "liked"} successfully!`,
      post,
    });
  } catch (error) {
    return handleError(res, error, "likeUnlikePost");
  }
};

export const getLikedPost = async (req, res) => {
  const userId = req.params.userId;

  console.log(userId);
  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ error: "User not found" });

    const arrayLikedPostId = user.likedPosts;
    const likedPosts = await Post.find({
      _id: { $in: arrayLikedPostId },
    })
      .populate({
        path: "userId",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(likedPosts);
  } catch (error) {
    return handleError(res, error, "getLikedPost");
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;

    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Provide text" });

    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({ error: "Post not found" });

    const comment = { user: userId, text };
    post.comments.push(comment);

    await post.save();

    res.status(200).json(post);
  } catch (error) {
    return handleError(res, error, "commentOnPost");
  }
};

export const getFollowingPosts = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ error: "User not found" });

    const following = user.following;
    const followingPosts = await Post.find({
      userId: { $in: following },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(followingPosts);
  } catch (error) {
    return handleError(res, error, "getFollowingPosts");
  }
};
