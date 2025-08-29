import { Router } from "express";
import { ResetPasswordController } from "../controllers/resetPasswordController";

const router = Router();

router.post("/request", ResetPasswordController.requestReset);
router.post("/verify", ResetPasswordController.verifyCode);
router.post("/password", ResetPasswordController.resetPassword);

export default router;
