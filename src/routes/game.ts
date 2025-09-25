import { Router } from "express"
import { AttemptController } from "../controllers/attemptController"
import { AchievementController } from "../controllers/achievementController"
import { GameController } from "../controllers/gameController"
import { authenticateToken } from "../middlewares/auth"

const router = Router()

// Attempts
router.get("/attempts", authenticateToken, AttemptController.getAttempts)
router.get("/attempts/user", authenticateToken, AttemptController.getAttemptByUserId)
router.post("/attempts", authenticateToken, AttemptController.postAttempt)

// Achievements
router.get("/achievements", authenticateToken, AchievementController.getAll)
router.get("/achievements/user", authenticateToken, AchievementController.getByUser)
router.post("/achievements", authenticateToken, AchievementController.add)
router.put("/achievements", authenticateToken, AchievementController.update)

// Game
router.post("/login", GameController.login)
router.post("/refresh", GameController.refresh)
router.post("/logout", GameController.logout)
router.put("/username", authenticateToken, GameController.updateUsername)

export default router
