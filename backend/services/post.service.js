import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";
import AppError from "../utils/appError.js";

class PostService {
  async #getPopulatedPosts(query) {
    return await Post.find(query)
      .sort({ createdAt: -1 })
      .populate({ path: "userId", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
  }

  async createPost(userId, { text, img }) {
    if (!text && !img)
      throw new AppError("Post must have text or image", 400);

    if (img) {
      const uploadResponse = await cloudinary.uploader.upload(img);
      img = uploadResponse.secure_url;
    }

    return await Post.create({ userId, text, img });
  }

  async getUserPostsById(userId) {
    return await this.#getPopulatedPosts({ userId });
  }

  async getAllPosts() {
    return await this.#getPopulatedPosts({});
  }

  async getUserPosts(username) {
    const user = await User.findOne({ username });
    if (!user) throw new AppError("User not found", 404);
    return await this.#getPopulatedPosts({ userId: user._id });
  }

  async getFollowingPosts(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    return await this.#getPopulatedPosts({
      userId: { $in: user.following },
    });
  }

  async getLikedPosts(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    return await this.#getPopulatedPosts({
      _id: { $in: user.likedPosts },
    });
  }

  async deletePost(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) throw new AppError("Post not found", 404);

    if (post.userId.toString() !== userId.toString()) {
      throw new AppError(
        "You are not authorized to delete this post",
        401,
      );
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(postId);
  }

  async toggleLikePost(postId, userId) {
    const [post, user] = await Promise.all([
      Post.findById(postId),
      User.findById(userId),
    ]);

    if (!post) throw new AppError("Post not found", 404);

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes.pull(userId);
      user.likedPosts.pull(postId);
    } else {
      post.likes.push(userId);
      user.likedPosts.push(postId);
      await Notification.create({
        from: userId,
        to: post.userId,
        type: "like",
      });
    }

    await Promise.all([post.save(), user.save()]);
    return { isLiked: !isLiked, post };
  }

  async commentOnPost(postId, userId, text) {
    if (!text) throw new AppError("Text is required", 400);
    const post = await Post.findById(postId);
    if (!post) throw new AppError("Post not found", 404);

    post.comments.push({ user: userId, text });
    return await post.save();
  }
}

export default new PostService();
