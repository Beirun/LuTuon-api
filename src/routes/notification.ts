import { Router } from "express";
import { NotificationController } from "../controllers/notificationController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.get("/user", authenticateToken, NotificationController.getNotificationsByUser);
router.put("/:notificationId", authenticateToken, NotificationController.updateNotificationStatus);
router.delete("/:notificationId", authenticateToken, NotificationController.deleteNotification);

export default router;
