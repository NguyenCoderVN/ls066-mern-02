import userService from "../services/user.service.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getUserProfile = catchAsync(async (req, res, next) => {
  const user = await userService.getUserByUsername(
    req.params.username,
  );

  res.status(200).json({
    status: "success",
    data: user,
  });
});

export const getSuggestedUsers = catchAsync(
  async (req, res, next) => {
    const users = await userService.getSuggestedUsers(req.user._id);

    res.status(200).json({
      status: "success",
      data: users,
    });
  },
);

export const followUnfollowUser = catchAsync(
  async (req, res, next) => {
    const { followerUserId: followerUserId } = req.params;
    const currentUserId = req.user._id.toString();
    const result = await userService.toggleFollow(
      currentUserId,
      followerUserId,
    );

    res.status(200).json(result);
  },
);

export const updateUser = catchAsync(async (req, res, next) => {
  const user = await userService.updateUser(req.user._id, req.body);

  res.status(200).json({
    status: "success",
    data: user,
  });
});
