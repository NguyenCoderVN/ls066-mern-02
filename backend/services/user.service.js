import { v2 as cloudinary } from "cloudinary";
import { compare } from "bcrypt";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import AppError from "../utils/appError.js";

class UserService {
  async #findUser(query) {
    const user = await User.findOne(query).select("-password");
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  async getUserById(id) {
    return await this.#findUser({ _id: id });
  }

  async getUserByUsername(username) {
    return await this.#findUser({ username });
  }

  async getSuggestedUsers(userId) {
    const user = await User.findById(userId).select("following");
    if (!user) throw new AppError("User not found", 404);

    return await User.aggregate([
      { $match: { _id: { $nin: [...user.following, userId] } } },
      { $sample: { size: 4 } },
      { $project: { password: 0 } },
    ]);
  }

  async updateUser(userId, updateData) {
    const { currentPassword, newPassword, ...fields } = updateData;
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    if (!!currentPassword !== !!newPassword) {
      throw new AppError(
        "Please provide both current and new passwords",
        400,
      );
    }

    if (currentPassword && newPassword) {
      if (!(await compare(currentPassword, user.password)))
        throw new AppError("Invalid current password", 400);
      user.password = newPassword;
    }

    if (fields.username && fields.username !== user.username) {
      if (await User.findOne({ username: fields.username }))
        throw new AppError("Username is already taken", 400);
    }

    const imageTypes = ["profileImg", "coverImg"];

    for (const type of imageTypes) {
      const image = fields[type];
      if (!image) continue;

      if (user[type]) {
        const publicId = user[type].split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }

      const { secure_url } = await cloudinary.uploader.upload(image);
      user[type] = secure_url;
    }

    const textFields = [
      "username",
      "fullName",
      "email",
      "bio",
      "link",
    ];

    textFields.forEach((field) => {
      if (fields[field] !== undefined) user[field] = fields[field];
    });

    await user.save();

    return user;
  }

  async toggleFollow(currentId, targetId) {
    if (currentId === targetId)
      throw new AppError("You cannot follow yourself", 400);

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentId),
      User.findById(targetId),
    ]);

    if (!currentUser || !targetUser)
      throw new AppError("User not found", 404);

    const isFollowing = currentUser.following.includes(targetId);
    const op = isFollowing ? "$pull" : "$push";

    await Promise.all([
      User.findByIdAndUpdate(currentId, {
        [op]: { following: targetId },
      }),
      User.findByIdAndUpdate(targetId, {
        [op]: { followers: currentId },
      }),
      !isFollowing &&
        Notification.create({
          from: currentId,
          to: targetId,
          type: "follow",
        }),
    ]);

    return {
      message: `${isFollowing ? "Unfollowed" : "Followed"} ${targetUser.username} successfully`,
    };
  }
}

export default new UserService();
