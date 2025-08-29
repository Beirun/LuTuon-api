import { db } from "../config/db";
import { feedback } from "../schema/feedback";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export class FeedbackService {
  // Create feedback
  async createFeedback(userId: string, feedbackMessage: string) {
    const newFeedback = {
      feedbackId: uuidv4(),
      userId,
      feedbackMessage,
      feedbackDate: new Date(),
    };

    await db.insert(feedback).values(newFeedback);
    return newFeedback;
  }

  // Get feedback by user
  async getFeedbackByUser(userId: string) {
    return await db.select().from(feedback).where(eq(feedback.userId, userId));
  }

  // Get all feedback
  async getAllFeedback() {
    return await db.select().from(feedback);
  }

// Delete feedback by ID
  async deleteFeedback(feedbackId: string) {
    await db.delete(feedback).where(eq(feedback.feedbackId, feedbackId));
    return { message: "Feedback deleted successfully" };
  }
}