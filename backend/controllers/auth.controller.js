import { handleError } from "../lib/utils/error.helper.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import { User } from "../models/user.model.js";
import { genSalt, hash, compare } from "bcrypt";

export const signup = async (req, res) => {
  try {
    const { username, fullName, password, email } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ error: "Email already exists" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: "Invalid email" });

    if (password.length < 6)
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    const newUser = new User({
      username,
      fullName,
      password: hashedPassword,
      email,
    });

    await newUser.save();
    generateTokenAndSetCookie(newUser._id, res);

    const { password: _, ...userResponse } = newUser._doc;
    res.status(201).json(userResponse);
  } catch (error) {
    return handleError(res, error, "signup");
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordValid = await compare(
      password,
      user?.password || "",
    );

    if (!user || !isPasswordValid)
      return res
        .status(400)
        .json({ error: "Invalid username or password" });

    generateTokenAndSetCookie(user._id, res);
    const { password: _, ...userResponse } = user._doc;

    res.status(200).json(userResponse);
  } catch (error) {
    return handleError(res, error, "login");
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return handleError(res, error, "logout");
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password",
    );
    res.status(200).json(user);
  } catch (error) {
    return handleError(res, error, "getMe");
  }
};
