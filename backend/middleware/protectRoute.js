import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import userService from "../services/user.service.js";

export const protectRoute = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    throw new AppError("Unauthorized, No token provided", 400);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await userService.getUserById(decoded.userId);

  req.user = user;
  next();
});
