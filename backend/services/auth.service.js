import { compare } from "bcrypt";
import { User } from "../models/user.model.js";
import AppError from "../utils/appError.js";
import { validateSignup } from "../middleware/validation.middleware.js";

class AuthService {
  async registerUser(userData) {
    validateSignup(userData);

    const existingUser = await User.findOne({
      $or: [
        { username: userData.username },
        { email: userData.email },
      ],
    });

    if (existingUser) {
      throw new AppError(
        `${existingUser.email === userData.email ? "Email" : "Username"} already exists`,
        400,
      );
    }

    const newUser = await User.create(userData);
    const userRes = newUser.toObject();
    delete userRes.password;

    return userRes;
  }

  async loginUser({ username, password }) {
    const user = await User.findOne({ username });
    const isMatch = await compare(password, user?.password || "");

    if (!user || !isMatch) {
      throw new AppError("Invalid username or password", 400);
    }

    const userRes = user.toObject();
    delete userRes.password;

    return userRes;
  }
}

export default new AuthService();
