import { Router } from "express";
import { signup } from "../controllers/auth.controller.js";

export const authRoutes = Router();

authRoutes.get("/signup", signup);
