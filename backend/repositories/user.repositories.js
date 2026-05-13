import { User } from "../models/user.model.js";
import { findEntityOrThrow } from "../lib/utils/repo.helper.js";

export const findUserByIdOrThrow = (userId) =>
  findEntityOrThrow(User, { _id: userId }, "User");

export const findUserByUsernameOrThrow = (username) =>
  findEntityOrThrow(User, { username }, "User");
