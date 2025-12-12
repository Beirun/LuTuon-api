// services/gameService.ts
import { db } from "../config/db"
import { user } from "../schema/user"
import { refreshToken } from "../schema/refreshToken"
import { log } from "../schema/log"
import { eq, sql, isNull, and } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { avatar } from "../schema/avatar"

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

  async login(email: string, password: string, ip: string, isGoogle: boolean = false) {
    const u = await db.select().from(user)
      .where(and(eq(user.userEmail, email), isNull(user.dateDeleted))).limit(1)
    if (u.length === 0) throw new Error("User not found")

    if(!isGoogle){
      const valid = await bcrypt.compare(password, u[0].passwordHash)
      if (!valid) throw new Error("Incorrect password")
    }

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

    // Per-food stats
    const attempts = await db.execute(sql`
      SELECT
        f.food_id AS "foodId",
        f.food_name AS "foodName",

        COALESCE(MAX(CASE WHEN a.attempt_type='Standard' THEN a.attempt_point END), 0)::int AS "highestPoint",
        COUNT(CASE WHEN a.attempt_type='Standard' THEN 1 END)::int AS "numberOfAttempts",
        COALESCE(BOOL_OR(a.attempt_type='Tutorial' AND a.attempt_point = 100), FALSE) AS "tutorialUnlock"

      FROM food f
      LEFT JOIN attempt a
        ON a.food_id = f.food_id
        AND a.user_id = ${u[0].userId}

      LEFT JOIN "user" u
        ON u.user_id = ${u[0].userId}
        AND u.date_deleted IS NULL

      GROUP BY f.food_id, f.food_name
    `)


    // Overall stats
    const statsRes = await db.execute(sql`
      WITH ach AS (
        SELECT
          COUNT(*)::int AS total_achievements
        FROM user_achievement ua
        JOIN achievement ach ON ach.achievement_id = ua.achievement_id
        JOIN "user" u ON u.user_id = ua.user_id
        WHERE ua.user_id = ${u[0].userId}
          AND u.date_deleted IS NULL
          AND ua.progress = ach.achievement_requirement
      )
      SELECT
        COUNT(a.attempt_id)::int AS "totalAttempts",
        COALESCE(SUM(a.attempt_point),0)::int AS "totalPoints",
        (SELECT total_achievements FROM ach) AS "totalAchievements"
      FROM attempt a
      JOIN "user" u ON u.user_id = a.user_id
      WHERE a.user_id = ${u[0].userId}
        AND u.date_deleted IS NULL
    `)

    const stats = statsRes.rows.length ? statsRes.rows[0] as {
      totalAttempts: number
      totalPoints: number
      totalAchievements: number
    } : { totalAttempts: 0, totalPoints: 0, totalAchievements: 0 }

    // Achievements
    const achievementsRes = await db.execute(sql`
      SELECT
        ua.achievement_id AS "achievementId",
        ac.achievement_name AS "achievementName",
        ua.progress,
        ua.date_completed AS "dateCompleted"
      FROM user_achievement ua
      JOIN achievement ac ON ac.achievement_id = ua.achievement_id
      WHERE ua.user_id = ${u[0].userId}
    `)
    const achievements = achievementsRes.rows as {
      achievementId: string
      achievementName: string
      progress: number
      dateCompleted: Date
    }[]

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
      attempts: attempts.rows as {
        foodId: string
        foodName: string
        highestPoint: number
        numberOfAttempts: number
        tutorialUnlock: boolean
      }[],
      stats,
      achievements
    }
  }

  async profile(userId: string, ip: string) {
    const u = await db.select().from(user)
      .where(and(eq(user.userId, userId), isNull(user.dateDeleted))).limit(1)
    if (u.length === 0) throw new Error("User not found")


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

    // Per-food stats
    const attempts = await db.execute(sql`
      SELECT
        f.food_id AS "foodId",
        f.food_name AS "foodName",

        COALESCE(MAX(CASE WHEN a.attempt_type='Standard' THEN a.attempt_point END), 0)::int AS "highestPoint",
        COUNT(CASE WHEN a.attempt_type='Standard' THEN 1 END)::int AS "numberOfAttempts",
        COALESCE(BOOL_OR(a.attempt_type='Tutorial' AND a.attempt_point = 100), FALSE) AS "tutorialUnlock"

      FROM food f
      LEFT JOIN attempt a
        ON a.food_id = f.food_id
        AND a.user_id = ${u[0].userId}

      LEFT JOIN "user" u
        ON u.user_id = ${u[0].userId}
        AND u.date_deleted IS NULL

      GROUP BY f.food_id, f.food_name
    `)


    // Overall stats
    const statsRes = await db.execute(sql`
      WITH ach AS (
        SELECT
          COUNT(*)::int AS total_achievements
        FROM user_achievement ua
        JOIN achievement ach ON ach.achievement_id = ua.achievement_id
        JOIN "user" u ON u.user_id = ua.user_id
        WHERE ua.user_id = ${u[0].userId}
          AND u.date_deleted IS NULL
          AND ua.progress = ach.achievement_requirement
      )
      SELECT
        COUNT(a.attempt_id)::int AS "totalAttempts",
        COALESCE(SUM(a.attempt_point),0)::int AS "totalPoints",
        (SELECT total_achievements FROM ach) AS "totalAchievements"
      FROM attempt a
      JOIN "user" u ON u.user_id = a.user_id
      WHERE a.user_id = ${u[0].userId}
        AND u.date_deleted IS NULL
    `)

    const stats = statsRes.rows.length ? statsRes.rows[0] as {
      totalAttempts: number
      totalPoints: number
      totalAchievements: number
    } : { totalAttempts: 0, totalPoints: 0, totalAchievements: 0 }

    // Achievements
    const achievementsRes = await db.execute(sql`
      SELECT
        ua.achievement_id AS "achievementId",
        ac.achievement_name AS "achievementName",
        ua.progress,
        ua.date_completed AS "dateCompleted"
      FROM user_achievement ua
      JOIN achievement ac ON ac.achievement_id = ua.achievement_id
      WHERE ua.user_id = ${u[0].userId}
    `)
    const achievements = achievementsRes.rows as {
      achievementId: string
      achievementName: string
      progress: number
      dateCompleted: Date
    }[]

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
      attempts: attempts.rows as {
        foodId: string
        foodName: string
        highestPoint: number
        numberOfAttempts: number
        tutorialUnlock: boolean
      }[],
      stats,
      achievements
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
    const taken = await db.select().from(user)
      .where(and(eq(user.userName, newUsername), isNull(user.dateDeleted))).limit(1)
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

  async updateAvatar(userId: string, avatarId: string) {
    const avtr = await db.select().from(avatar)
    .where(eq(avatar.avatarId, avatarId)).limit(1)
    if (avtr.length < 1) throw new Error("Avatar does not exists")


    await db.update(user)
      .set({ avatarId: avatarId })
      .where(and(eq(user.userId, userId), isNull(user.dateDeleted)))

    await this.addLog(userId, `Avatar changed to ${avtr[0].avatarName}`)
    return { message: "Avatar updated successfully" }
  }
}
