import { v2 as cloudinary } from "cloudinary";
import { compare, genSalt, hash } from "bcrypt";

import { handleError } from "../lib/utils/error.helper.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user)
      return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    return handleError(res, error, "getUserProfile");
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const user = await User.findById(userId);

    const { followerUserId } = req.params;
    const followerUser = await User.findById(followerUserId);

    if (userId === followerUserId)
      return res
        .status(400)
        .json({ error: "You cannot follow yourself" });

    if (!user || !followerUser)
      return res.status(404).json({ error: "User not found" });

    const isFollowing = user.following.includes(followerUserId);

    if (!isFollowing) {
      await user.updateOne({ $push: { following: followerUserId } });
      await followerUser.updateOne({ $push: { followers: userId } });
      const newNotification = new Notification({
        from: userId,
        to: followerUserId,
        type: "follow",
      });
      await newNotification.save();

      return res
        .status(200)
        .json({ message: "User followed successfully" });
    } else {
      await user.updateOne({ $pull: { following: followerUserId } });
      await followerUser.updateOne({ $pull: { followers: userId } });
      return res
        .status(200)
        .json({ message: "User unfollowed successfully" });
    }
  } catch (error) {
    return handleError(res, error, "followUnfollowUser");
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("following");

    const suggestedUsers = await User.aggregate([
      { $match: { _id: { $nin: [...user.following, userId] } } },
      { $sample: { size: 4 } },
      { $project: { password: 0 } },
    ]);

    res.status(200).json(suggestedUsers);
  } catch (error) {
    return handleError(res, error, "getSuggestedUsers");
  }
};

export const updateUser = async (req, res) => {
  const { currentPassword, newPassword, ...fields } = req.body;
  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ error: "User not found" });

    if (fields.username && fields.username !== user.username) {
      const existingUser = await User.findOne({
        username: fields.username,
      });
      if (existingUser)
        return res
          .status(400)
          .json({ error: "Username already taken" });
      user.username = fields.username;
    }

    // Handle Password Update
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword)
        return res
          .status(400)
          .json({ error: "Provide both passwords" });

      const isMatch = await compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ error: "Invalid password" });

      const salt = await genSalt(10);
      user.password = await hash(newPassword, salt);
    }

    // Handle Images
    for (const imgType of ["profileImg", "coverImg"]) {
      if (fields[imgType]) {
        if (user[imgType])
          await cloudinary.uploader.destroy(
            user[imgType].split("/").pop().split(".")[0],
          );
        const uploaded = await cloudinary.uploader.upload(
          fields[imgType],
        );
        user[imgType] = uploaded.secure_url;
      }
    }

    // Update remaining text fields
    Object.assign(user, {
      username: fields.username || user.username,
      fullName: fields.fullName || user.fullName,
      email: fields.email || user.email,
      bio: fields.bio || user.bio,
      link: fields.link || user.link,
    });

    await user.save();
    user.password = null;
    res.status(200).json(user);
  } catch (err) {
    handleError(res, err, "updateUser");
  }
};
