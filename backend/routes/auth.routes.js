import { Router } from "express";

export const authRoutes = Router();

authRoutes.get("/signup", (_req, res) => {
  res.send("Signup Page");
});
