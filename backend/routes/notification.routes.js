import { Router } from "express";
import {
  deleteNotifications,
  deleteOneNotification,
  getNotifications,
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

export const notificationRouters = Router();

notificationRouters.use(protectRoute);

notificationRouters.get("/", getNotifications);
notificationRouters.delete("/", deleteNotifications);
notificationRouters.delete("/:notifyId", deleteOneNotification);
