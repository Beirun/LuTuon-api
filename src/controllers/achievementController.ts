// controllers/achievementController.ts
import { Request, Response } from "express";
import { achievementService } from "../services/achievementService";

export class AchievementController {
  static async getAll(req: Request, res: Response) {
    try {
      const data = await achievementService.getAllAchievements();
      res.status(200).json(data);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  }

  static async getByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ error: "Missing userId" });

      const data = await achievementService.getAchievementsByUser(userId);
      res.status(200).json(data);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  }

  static async add(req: Request, res: Response) {
    try {
      const { userId, achievementId, progress, dateCompleted } = req.body;

      if (!userId || !achievementId || progress === undefined || !dateCompleted) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const data = await achievementService.addAchievement({
        userId,
        achievementId,
        progress: Number(progress),
        dateCompleted: new Date(dateCompleted),
      });

      res.status(201).json(data);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { userId, achievementId, progress, dateCompleted } = req.body;

      if (!userId || !achievementId || progress === undefined || !dateCompleted) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const data = await achievementService.updateAchievement({
        userId,
        achievementId,
        progress: Number(progress),
        dateCompleted: new Date(dateCompleted),
      });

      res.status(200).json(data);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  }
}
