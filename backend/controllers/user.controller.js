import { handleError } from "../lib/utils/error.helper.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";

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

    const usersFollowingByMe =
      await User.findById(userId).select("following");
    const usersNotMe = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = usersNotMe.filter(
      (user) => !usersFollowingByMe.following.includes(user._id),
    );

    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    return handleError(res, error, "getSuggestedUsers");
  }
};
