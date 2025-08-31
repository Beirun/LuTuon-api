// services/notificationService.ts
import { db } from "../config/db"
import { notification } from "../schema/notification"
import { log } from "../schema/log"
import { eq } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"

export class NotificationService {
  private async addLog(userId: string, description: string) {
    await db.insert(log).values({
      logId: uuidv4(),
      userId,
      logDescription: description,
      logDate: new Date(),
    })
  }

  async createNotification(data: { notificationId: string; userId: string; notificationTitle: string; notificationMessage: string; notificationStatus: string; notificationDate: Date }) {
    data.notificationId = uuidv4()
    const [newNotification] = await db.insert(notification).values(data).returning()
    return newNotification
  }

  async getNotificationsByUser(userId: string) {
    return await db.select().from(notification).where(eq(notification.userId, userId))
  }

  async updateNotificationStatus(notificationId: string, status: string) {
    const [updatedNotification] = await db.update(notification).set({ notificationStatus: status }).where(eq(notification.notificationId, notificationId)).returning()
    if (updatedNotification) await this.addLog(updatedNotification.userId, `Notification ${notificationId} status updated to ${status}`)
    return updatedNotification
  }

  async deleteNotification(notificationId: string) {
    const notif = await db.select().from(notification).where(eq(notification.notificationId, notificationId))
    if (notif.length > 0) await this.addLog(notif[0].userId, `Notification ${notificationId} deleted`)
    await db.delete(notification).where(eq(notification.notificationId, notificationId))
    return { message: "Notification deleted successfully" }
  }
}
