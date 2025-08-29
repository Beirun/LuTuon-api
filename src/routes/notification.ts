import { Router } from "express";
import { NotificationController } from "../controllers/notificationController";

const router = Router();

router.post("/", NotificationController.createNotification);
router.get("/:userId", NotificationController.getNotificationsByUser);
router.put("/:notificationId", NotificationController.updateNotificationStatus);
router.delete("/:notificationId", NotificationController.deleteNotification);

export default router;
