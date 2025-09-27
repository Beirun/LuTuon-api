import { db } from "../config/db";
import { notification } from "../schema/notification";
import { eq } from "drizzle-orm";

export class NotificationService {

  // Get all notifications for a specific user
  async getNotificationsByUser(userId: string) {
    return await db
      .select()
      .from(notification)
      .where(eq(notification.userId, userId));
  }

  // Update notification status (e.g., "read")
  async updateNotificationStatus(notificationId: string, status: string) {
    const [updatedNotification] = await db
      .update(notification)
      .set({ notificationStatus: status })
      .where(eq(notification.notificationId, notificationId))
      .returning();

    return updatedNotification;
  }

  // Delete a notification
  async deleteNotification(notificationId: string) {
    await db
      .delete(notification)
      .where(eq(notification.notificationId, notificationId));

    return { message: "Notification deleted successfully" };
  }
}
