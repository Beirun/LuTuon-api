import { Router } from "express";
import { FeedbackController } from "../controllers/feedbackController";

const router = Router();

router.post("/", FeedbackController.createFeedback);
router.get("/user/:userId", FeedbackController.getFeedbackByUser);
router.get("/", FeedbackController.getAllFeedback);
router.delete("/:feedbackId", FeedbackController.deleteFeedback);

export default router;
