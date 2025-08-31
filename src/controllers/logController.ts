// controllers/logController.ts
import { Request, Response } from "express"
import { LogService } from "../services/logService"

const logService = new LogService()

export class LogController {
  static async getAllLogs(req: Request, res: Response) {
    try {
      const logs = await logService.getAllLogs()
      res.status(200).json(logs)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  }
}
