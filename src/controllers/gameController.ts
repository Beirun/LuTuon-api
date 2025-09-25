// controllers/gameController.ts
import { Request, Response } from "express"
import { AuthRequest } from "../middlewares/auth"
import { GameService } from "../services/gameService"

const gameService = new GameService()

export class GameController {
  static async login(req: Request, res: Response) {
    const ip = req.ip || "unknown"
    try {
      const { email, password } = req.body
      const result = await gameService.login(email, password, ip)
      res.json(result)
    } catch (e: any) {
      res.status(400).json({ error: e.message })
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) throw new Error("Refresh token required")
      const result = await gameService.refresh(refreshToken)
      res.json(result)
    } catch (e: any) {
      res.status(400).json({ error: e.message })
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) throw new Error("Refresh token required")
      const result = await gameService.logout(refreshToken)
      res.json(result)
    } catch (e: any) {
      res.status(400).json({ error: e.message })
    }
  }

  // NEW: update username
  static async updateUsername(req: AuthRequest, res: Response) {
    try {
      const { newUsername } = req.body
      if (!newUsername) throw new Error("New username required")
      const result = await gameService.updateUsername(req.user.userId, newUsername)
      res.json(result)
    } catch (e: any) {
      res.status(400).json({ error: e.message })
    }
  }
}
