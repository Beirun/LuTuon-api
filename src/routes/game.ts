import { Router } from "express";
import { AttemptController } from "../controllers/attemptController";
import { AchievementController } from "../controllers/achievementController";

const router = Router();

// Attempts
router.get("/attempts", AttemptController.getAttempts);
router.post("/attempts", AttemptController.postAttempt);

// Achievements
router.get("/achievements", AchievementController.getAll);
router.get("/achievements/:userId", AchievementController.getByUser);
router.post("/achievements", AchievementController.add);
router.put("/achievements", AchievementController.update);



export default router;
