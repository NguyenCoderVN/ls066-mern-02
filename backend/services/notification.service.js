import { Notification } from "../models/notification.model.js";
import AppError from "../utils/appError.js";

class NotificationService {
  async getNotifications(userId) {
    const [notifications] = await Promise.all([
      Notification.find({ to: userId })
        .sort({ createdAt: -1 })
        .populate({
          path: "from",
          select: "username profileImg",
        }),
      Notification.updateMany(
        {
          to: userId,
        },
        { read: true },
      ),
    ]);

    return notifications;
  }

  async deleteNotifications(userId) {
    await Notification.deleteMany({ to: userId });
    return { message: "Notifications deleted successfully" };
  }

  async deleteOneNotification(notificationId, userId) {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    if (notification.to.toString() !== userId.toString()) {
      throw new AppError(
        "You are not allowed to delete this notification",
        403,
      );
    }

    await Notification.findByIdAndDelete(notificationId);
    return { message: "Notification deleted successfully" };
  }
}

export default new NotificationService();
