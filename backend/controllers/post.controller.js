import { handleError } from "../lib/utils/error.helper.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";

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
