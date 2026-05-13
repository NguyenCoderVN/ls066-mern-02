import NotificationService from "../services/notification.service.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getNotifications = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const notifications =
    await NotificationService.getNotifications(userId);

  res.status(200).json(notifications);
});

export const deleteNotifications = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const result =
    await NotificationService.deleteNotifications(userId);

  res.status(200).json(result);
});

export const deleteOneNotification = catchAsync(async (req, res) => {
  const { notifyId } = req.params;
  const userId = req.user._id;

  const result = await NotificationService.deleteOneNotification(
    notifyId,
    userId,
  );

  res.status(200).json(result);
});
