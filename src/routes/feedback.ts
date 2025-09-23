import { Router } from "express";
import { FeedbackController } from "../controllers/feedbackController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.post("/", authenticateToken, FeedbackController.createFeedback);
router.get("/user", authenticateToken, FeedbackController.getFeedbackByUser);
router.get("/", authenticateToken, FeedbackController.getAllFeedback);
router.delete("/:feedbackId", authenticateToken, FeedbackController.deleteFeedback);

export default router;
