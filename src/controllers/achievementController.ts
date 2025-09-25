// controllers/achievementController.ts
import { Request, Response } from "express";
import { achievementService } from "../services/achievementService";
import { AuthRequest } from "middlewares/auth";

export class AchievementController {
  static async getAll(req: Request, res: Response) {
    try {
      const data = await achievementService.getAllAchievements();
      res.status(200).json(data);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  }

  static async getByUser(req: AuthRequest, res: Response) {
    try {

      const data = await achievementService.getAchievementsByUser(req.user.userId);
      res.status(200).json(data);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  }

  static async add(req: AuthRequest, res: Response) {
    try {
      const { achievementId, progress, dateCompleted } = req.body;

      if (!achievementId || progress === undefined || !dateCompleted) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const data = await achievementService.addAchievement({
        userId: req.user.userId,
        achievementId,
        progress: Number(progress),
        dateCompleted: new Date(dateCompleted),
      });

      res.status(201).json(data);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const { achievementId, progress, dateCompleted } = req.body;

      if (!achievementId || progress === undefined || !dateCompleted) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const data = await achievementService.updateAchievement({
        userId: req.user.userId,
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
