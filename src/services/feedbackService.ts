// services/feedbackService.ts
import { db } from "../config/db"
import { feedback } from "../schema/feedback"
import { log } from "../schema/log"
import { eq } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"
import { user } from "../schema/user"
export class FeedbackService {
  private async addLog(userId: string, description: string) {
    await db.insert(log).values({
      logId: uuidv4(),
      userId,
      logDescription: description,
      logDate: new Date(),
    })
  }

  async createFeedback(userId: string, feedbackMessage: string) {
    const newFeedback = { feedbackId: uuidv4(), userId, feedbackMessage, feedbackDate: new Date() }
    await db.insert(feedback).values(newFeedback)
    await this.addLog(userId, "Submitted a feedback")
    return newFeedback
  }

  async getFeedbackByUser(userId: string) {
    return await db.select().from(feedback).where(eq(feedback.userId, userId))
  }

  async getAllFeedback() {
  return await db
    .select({
      feedbackId: feedback.feedbackId,
      feedbackMessage: feedback.feedbackMessage,
      feedbackDate: feedback.feedbackDate,
      userName: user.userName,
      userEmail: user.userEmail,
    })
    .from(feedback)
    .leftJoin(user, eq(feedback.userId, user.userId))
}

  async deleteFeedback(feedbackId: string) {
    const fb = await db.select().from(feedback).where(eq(feedback.feedbackId, feedbackId))
    if (fb.length > 0) await this.addLog(fb[0].userId, "Deleted a feedback")
    await db.delete(feedback).where(eq(feedback.feedbackId, feedbackId))
    return { message: "Feedback deleted successfully" }
  }
}
