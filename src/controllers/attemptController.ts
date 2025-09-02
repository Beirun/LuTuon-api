// controllers/attemptController.ts
import { Request, Response } from "express";
import { AttemptService } from "../services/attemptService";

const attemptService = new AttemptService();

export class AttemptController {
  static async getAttempts(req: Request, res: Response) {
    try {
      const data = await attemptService.getAllAttempts();
      res.status(200).json(data);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  }
  static async getAttemptByUserId(req: Request, res: Response) {
    const {userId} = req.params;
    try {
      const data = await attemptService.getAllAttemptByUserId(userId);
      res.status(200).json(data);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  }

  static async postAttempt(req: Request, res: Response) {
    try {
      const { userId, foodId, attemptPoint, attemptDate, attemptDuration, attemptType } = req.body;

      if (!userId || !foodId || !attemptPoint || !attemptDate || !attemptDuration || !attemptType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const data = await attemptService.createAttempt({
        userId,
        foodId,
        attemptPoint: Number(attemptPoint),
        attemptDate: new Date(attemptDate),
        attemptDuration: new Date(attemptDuration),
        attemptType,
      });

      res.status(201).json(data);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  }
}
