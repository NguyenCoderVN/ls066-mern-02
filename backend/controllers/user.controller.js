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
    const userId = req.user._id;
    const user = await User.findById(userId);

    const { followerId } = req.params;
    const followerUser = await User.findById(followerId);

    if (userId.toString() === followerId)
      return res
        .status(400)
        .json({ error: "You cannot follow yourself" });

    if (!user || !followerUser)
      return res.status(404).json({ error: "User not found" });

    const isFollowing = user.following.includes(followerId);

    if (!isFollowing) {
      await user.updateOne({ $push: { following: followerId } });
      await followerUser.updateOne({ $push: { followers: userId } });
      const newNotification = new Notification({
        from: userId,
        to: followerId,
        type: "follow",
      });
      await newNotification.save();

      return res
        .status(200)
        .json({ message: "User followed successfully" });
    } else {
      await user.updateOne({ $pull: { following: followerId } });
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
  const {
    username,
    fullName,
    email,
    currentPassword,
    newPassword,
    bio,
    link,
  } = req.body;
  let { profileImg, coverImg } = req.body;
  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ error: "User not found" });

    if (
      (currentPassword && !newPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({
        error: "Please provide both current and new password",
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await compare(currentPassword, user.password);
      if (!isMatch)
        return res
          .status(400)
          .json({ error: "Invalid current password" });
      if (newPassword.length < 6)
        return res.status(400).json({ error: "Password too short" });

      const salt = await genSalt(10);
      user.password = await hash(newPassword, salt);
    }
    if (profileImg) {
      if (user.profileImg)
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0],
        );

      const resUploadedProfileImg =
        await cloudinary.uploader.upload(profileImg);
      profileImg = resUploadedProfileImg.secure_url;
    }
    if (coverImg) {
      if (user.coverImg)
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0],
        );

      const resUploadedCoverImg =
        await cloudinary.uploader.upload(coverImg);
      coverImg = resUploadedCoverImg.secure_url;
    }
    user.username = username || (await user).username;
    user.fullName = fullName || (await user).fullName;
    user.email = email || (await user).email;
    user.bio = bio || (await user).bio;
    user.link = link || (await user).link;
    user.profileImg = profileImg || (await user).profileImg;
    user.coverImg = coverImg || (await user).coverImg;
    user = await user.save();
    user.password = null;
    res.status(200).json(user);
  } catch (err) {
    return handleError(res, err, "updateUser");
  }
};
