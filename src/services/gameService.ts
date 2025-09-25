// services/gameService.ts
import { db } from "../config/db"
import { user } from "../schema/user"
import { attempt } from "../schema/attempt"
import { refreshToken } from "../schema/refreshToken"
import { log } from "../schema/log"
import { food } from "../schema/food"       // <-- make sure this schema exists
import { eq, sql, isNull, and } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const ACCESS_TOKEN_EXPIRY = "1h"
const REFRESH_TOKEN_EXPIRY_DAYS = 14

export class GameService {
  private async addLog(userId: string, description: string) {
    await db.insert(log).values({
      logId: uuidv4(),
      userId,
      logDescription: description,
      logDate: new Date(),
    })
  }

  async login(email: string, password: string, ip: string) {
    const u = await db.select().from(user).where(and(eq(user.userEmail, email), isNull(user.dateDeleted))).limit(1)
    if (u.length === 0) throw new Error("User not found")

    const valid = await bcrypt.compare(password, u[0].passwordHash)
    if (!valid) throw new Error("Incorrect password")

    const payload = { userId: u[0].userId, roleId: u[0].roleId }
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRY })
    const refreshTokenValue = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS)

    await db.insert(refreshToken).values({
      userId: u[0].userId,
      token: refreshTokenValue,
      ipAddress: ip,
      expiresAt,
    })

    await this.addLog(u[0].userId, "Logged In To Game")

    // Return stats as [{ foodId, foodName, highestPoint, tutorialUnlock }]
    // Updated to include dateDeleted filter in the SQL query
    const stats = await db.execute(sql`
      SELECT
        a.food_id   AS "foodId",
        f.food_name AS "foodName",
        MAX(a.attempt_point) AS "highestPoint",
        BOOL_OR(a.attempt_type='Tutorial' AND a.attempt_point=100) AS "tutorialUnlock"
      FROM attempt a
      JOIN food f ON f.food_id = a.food_id
      JOIN "user" u ON u.user_id = a.user_id
      WHERE a.user_id = ${u[0].userId} AND u.date_deleted IS NULL
      GROUP BY a.food_id, f.food_name
    `)

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      user: {
        userId: u[0].userId,
        userEmail: u[0].userEmail,
        userName: u[0].userName,
        userDob: u[0].userDob,
        avatarId: u[0].avatarId,
      },
      attempts: stats.rows as {
        foodId: string
        foodName: string
        highestPoint: number
        tutorialUnlock: boolean
      }[]
    }
  }

  async refresh(token: string) {
    const row = await db.select().from(refreshToken).where(eq(refreshToken.token, token)).limit(1)
    if (row.length === 0) throw new Error("Invalid refresh token")
    const tokenRow = row[0]
    if (tokenRow.revokedAt || new Date(tokenRow.expiresAt) < new Date()) {
      throw new Error("Refresh token expired or revoked")
    }

    const payload = { userId: tokenRow.userId }
    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRY })

    await this.addLog(tokenRow.userId, "Access token refreshed")
    return { accessToken: newAccessToken }
  }

  async logout(token: string) {
    const row = await db.select().from(refreshToken).where(eq(refreshToken.token, token)).limit(1)
    if (row.length > 0) {
      await db.update(refreshToken)
        .set({ revokedAt: new Date() })
        .where(eq(refreshToken.token, token))
      await this.addLog(row[0].userId, "Logged out from Unity game")
    }
    return { message: "Logged out successfully" }
  }

  async updateUsername(userId: string, newUsername: string) {
    const taken = await db.select().from(user).where(and(eq(user.userName, newUsername), isNull(user.dateDeleted))).limit(1)
    if (taken.length > 0) throw new Error("Username already taken")

    const old = await db.select({ userName: user.userName })
                        .from(user).where(and(eq(user.userId, userId), isNull(user.dateDeleted))).limit(1)
    const oldName = old.length ? old[0].userName : ""

    await db.update(user)
      .set({ userName: newUsername })
      .where(and(eq(user.userId, userId), isNull(user.dateDeleted)))

    await this.addLog(userId, `Username changed from ${oldName} to ${newUsername}`)
    return { message: "Username updated successfully", userName: newUsername }
  }
}