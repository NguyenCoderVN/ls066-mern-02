import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { handleError } from "../lib/utils/error.helper.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token)
      return res
        .status(401)
        .json({ error: "Unauthorized, No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select(
      "-password",
    );
    if (!user)
      return res
        .status(401)
        .json({ error: "Unauthorized, User not found" });

    req.user = user;
    next();
  } catch (error) {
    return handleError(res, error, "protectRoute");
  }
};
