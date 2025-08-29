import { Request, Response } from "express";
import { ResetPasswordService } from "../services/resetPasswordService";

const resetService = new ResetPasswordService();

export class ResetPasswordController {
  static async requestReset(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress || "unknown";

      const result = await resetService.requestReset(email, ipAddress);
      res.status(200).json({
        message: "Reset code generated. Please check your email.",
        ...result,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async verifyCode(req: Request, res: Response) {
    try {
      const { email, code } = req.body;

      const result = await resetService.verifyCode(email, code);
      res.status(200).json({
        message: "Reset code is valid",
        resetId: result.codeId,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, code, newPassword } = req.body;

      const result = await resetService.resetPassword(email, code, newPassword);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
