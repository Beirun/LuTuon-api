import { Request, Response } from "express";
import { NotificationService } from "../services/notificationService";

const notificationService = new NotificationService();

export class NotificationController {
  // Create
  static async createNotification(req: Request, res: Response) {
    try {
      const newNotification = await notificationService.createNotification(req.body);
      res.status(201).json(newNotification);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get all by user
  static async getNotificationsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const notifications = await notificationService.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Update status
  static async updateNotificationStatus(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const { status } = req.body;

      const updated = await notificationService.updateNotificationStatus(notificationId, status);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Delete
  static async deleteNotification(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const result = await notificationService.deleteNotification(notificationId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
