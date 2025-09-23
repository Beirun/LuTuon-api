import { Request, Response } from "express";
import { FeedbackService } from "../services/feedbackService";
import { AuthRequest } from "middlewares/auth";

const feedbackService = new FeedbackService();

export class FeedbackController {
  // Create feedback
  static async createFeedback(req: Request, res: Response) {
    try {
      const { userId, feedbackMessage } = req.body;
      if (!userId || !feedbackMessage) {
        return res.status(400).json({ message: "userId and feedback Message are required" });
      }

      const newFeedback = await feedbackService.createFeedback(userId, feedbackMessage);
      res.status(201).json(newFeedback);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating feedback" });
    }
  }

  // Get feedback by user
  static async getFeedbackByUser(req: AuthRequest, res: Response) {
    try {
      const feedbacks = await feedbackService.getFeedbackByUser(req.user.userId);
      res.json(feedbacks);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching feedback"});
    }
  }

  // Get all feedback
  static async getAllFeedback(req: Request, res: Response) {
    try {
      const feedbacks = await feedbackService.getAllFeedback();
      res.json(feedbacks);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching feedback"});
    }
  }

  // Delete feedback
  static async deleteFeedback(req: Request, res: Response) {
    try {
      const { feedbackId } = req.params;
      const result = await feedbackService.deleteFeedback(feedbackId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting feedback"});
    }
  }
}
