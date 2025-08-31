// routes/log.ts
import { Router } from "express"
import { LogController } from "../controllers/logController"
import { authenticateToken } from "../middlewares/auth";

const router = Router()

// GET /logs -> view all logs with user info
router.get("/", authenticateToken, LogController.getAllLogs)

export default router
