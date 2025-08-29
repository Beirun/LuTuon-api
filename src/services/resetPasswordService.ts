import { db } from "../config/db";
import { resetPassword } from "../schema/resetPassword";
import { user } from "../schema/user";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../config/sendEmail";

export class ResetPasswordService {
  async requestReset(email: string, ipAddress: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const u = await db.select().from(user).where(eq(user.userEmail, email));
    if (u.length === 0) throw new Error("Email not found");

    await db.insert(resetPassword).values({
      userId: u[0].userId,
      code,
      ipAddress,
      expiresAt,
    });

    const html = `
      <div style="font-family: Arial, sans-serif; padding:20px; background:#f9f9f9; color:#333;">
        <h2 style="color:#444;">Password Reset Request</h2>
        <p>Hello ${u[0].userName || "User"},</p>
        <p>You requested a password reset. Use the code below to reset your password:</p>
        <div style="margin:20px 0; padding:15px; background:#fff; border:1px solid #ddd; border-radius:8px; text-align:center;">
          <span style="font-size:18px; font-weight:bold; color:#2c3e50;">${code}</span>
        </div>
        <p style="font-size:14px; color:#666;">This code will expire at <strong>${expiresAt.toLocaleString()}</strong>.</p>
        <p>If you did not request this reset, you can safely ignore this email.</p>
        <hr style="margin:20px 0; border:none; border-top:1px solid #ddd;" />
        <p style="font-size:12px; color:#aaa;">This is an automated message, please do not reply.</p>
      </div>
    `;

    await sendEmail(email, "Password Reset Request", html);

    return { code, expiresAt };
  }

  async verifyCode(email: string, code: string) {
    const u = await db.select().from(user).where(eq(user.userEmail, email));
    if (u.length === 0) throw new Error("Email not found");

    const result = await db
      .select()
      .from(resetPassword)
      .where(eq(resetPassword.userId, u[0].userId));

    const reset = result.find(
      (r) => r.code === code && !r.isUsed && r.expiresAt > new Date()
    );

    if (!reset) throw new Error("Invalid or expired reset code");

    return reset;
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const reset = await this.verifyCode(email, code);

    const u = await db.select().from(user).where(eq(user.userEmail, email));
    if (u.length === 0) throw new Error("Email not found");

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await db
      .update(user)
      .set({ passwordHash: hashedPassword })
      .where(eq(user.userId, u[0].userId));

    await db
      .update(resetPassword)
      .set({ isUsed: true })
      .where(eq(resetPassword.codeId, reset.codeId));

    return { message: "Password reset successful" };
  }
}
