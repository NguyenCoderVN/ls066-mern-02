import { handleError } from "../lib/utils/error.helper.js";
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

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post)
      return res.status(404).json({ error: "Post not found" });

    console.log("post.userId", post.userId);
    console.log("req.user._id", req.user._id);
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
