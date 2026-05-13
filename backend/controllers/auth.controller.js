import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import { catchAsync } from "../utils/catchAsync.js";
import authService from "../services/auth.service.js";
import userService from "../services/user.service.js";

export const signup = catchAsync(async (req, res, next) => {
  const user = await authService.registerUser(req.body);
  generateTokenAndSetCookie(user._id, res);

  res.status(201).json({
    status: "success",
    data: user,
  });
});

export const login = catchAsync(async (req, res, next) => {
  const user = await authService.loginUser(req.body);
  generateTokenAndSetCookie(user._id, res);

  res.status(200).json({
    status: "success",
    data: user,
  });
});

export const logout = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "", { maxAge: 0 });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

export const getMe = catchAsync(async (req, res, next) => {
  const user = await userService.getUserById(req.user._id);

  res.status(200).json({
    status: "success",
    data: user,
  });
});
