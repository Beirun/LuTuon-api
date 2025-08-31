import { Router } from "express";
import { NotificationController } from "../controllers/notificationController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.post("/", authenticateToken, NotificationController.createNotification);
router.get("/:userId", authenticateToken, NotificationController.getNotificationsByUser);
router.put("/:notificationId", authenticateToken, NotificationController.updateNotificationStatus);
router.delete("/:notificationId", authenticateToken, NotificationController.deleteNotification);

export default router;
