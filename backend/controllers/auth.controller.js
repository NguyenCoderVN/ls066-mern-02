import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import { User } from "../models/user.model.js";
import { genSalt, hash, compare } from "bcrypt";

export const signup = async (req, res) => {
  try {
    const { username, fullName, password, email } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res
        .status(400)
        .json({ message: "Email already exists" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Invalid email" });

    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

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
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: error.message });
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
    console.log("Error in login controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("Error logging in logout controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
