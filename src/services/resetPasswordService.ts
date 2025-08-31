// services/resetPasswordService.ts
import { db } from "../config/db"
import { resetPassword } from "../schema/resetPassword"
import { user } from "../schema/user"
import { eq } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"
import bcryptjs from "bcryptjs"
import { sendEmail } from "../config/sendEmail"
import { log } from "../schema/log"
import { getTemplate } from "../config/emailTemplate"

export class ResetPasswordService {
  private async addLog(userId: string, description: string) {
    await db.insert(log).values({
      logId: uuidv4(),
      userId,
      logDescription: description,
      logDate: new Date(),
    })
  }

  async requestReset(email: string, ipAddress: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    const u = await db.select().from(user).where(eq(user.userEmail, email))
    if (u.length === 0) throw new Error("Email not found")

    await db.insert(resetPassword).values({ userId: u[0].userId, code, ipAddress, expiresAt })
    await this.addLog(u[0].userId, "Password reset requested")

    const html = getTemplate(u[0].userName,code,expiresAt);
    await sendEmail(email, "Password Reset Request", html)
    return { code, expiresAt }
  }

  async verifyCode(email: string, code: string) {
    const u = await db.select().from(user).where(eq(user.userEmail, email))
    if (u.length === 0) throw new Error("Email not found")

    const result = await db.select().from(resetPassword).where(eq(resetPassword.userId, u[0].userId))
    const reset = result.find(r => r.code === code && !r.isUsed && r.expiresAt > new Date())
    if (!reset) throw new Error("Invalid or expired reset code")

    await this.addLog(u[0].userId, "Password reset code verified")
    return reset
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const reset = await this.verifyCode(email, code)
    const u = await db.select().from(user).where(eq(user.userEmail, email))
    if (u.length === 0) throw new Error("Email not found")

    const hashedPassword = await bcryptjs.hash(newPassword, 10)
    await db.update(user).set({ passwordHash: hashedPassword }).where(eq(user.userId, u[0].userId))
    await db.update(resetPassword).set({ isUsed: true }).where(eq(resetPassword.codeId, reset.codeId))

    await this.addLog(u[0].userId, "Password reset successfully")
    return { message: "Password reset successful" }
  }
}
