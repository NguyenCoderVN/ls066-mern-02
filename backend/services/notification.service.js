import { Notification } from "../models/notification.model.js";

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
}

export default new NotificationService();
