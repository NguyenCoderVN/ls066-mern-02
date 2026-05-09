import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import { User } from "../models/user.model.js";
import { genSalt, hash } from "bcrypt";

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
    console.log("Error signing up user: ", error);
    res.status(500).json({ message: error.message });
  }
};
