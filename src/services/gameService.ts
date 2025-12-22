// services/gameService.ts
import { db } from "../config/db";
import { user } from "../schema/user";
import { refreshToken } from "../schema/refreshToken";
import { log } from "../schema/log";
import { eq, sql, isNull, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { avatar } from "../schema/avatar";
import { userAchievement } from "../schema/userAchievement";

const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_EXPIRY_DAYS = 14;

export class GameService {
  private async addLog(userId: string, description: string) {
    await db.insert(log).values({
      logId: uuidv4(),
      userId,
      logDescription: description,
      logDate: new Date(),
    });
  }

  async getAttempts(userId: string) {
    const u = await db
      .select()
      .from(user)
      .where(and(eq(user.userId, userId), isNull(user.dateDeleted)))
      .limit(1);
    if (u.length === 0) throw new Error("User not found");
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
    `);
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
    `);

    const stats = statsRes.rows.length
      ? (statsRes.rows[0] as {
          totalAttempts: number;
          totalPoints: number;
          totalAchievements: number;
        })
      : { totalAttempts: 0, totalPoints: 0, totalAchievements: 0 };
    return {
      attempts: attempts.rows as {
        foodId: string;
        foodName: string;
        highestPoint: number;
        numberOfAttempts: number;
        tutorialUnlock: boolean;
      }[],
      stats,
    };
  }

  async getAchievements(userId: string) {
    const u = await db
      .select()
      .from(user)
      .where(and(eq(user.userId, userId), isNull(user.dateDeleted)))
      .limit(1);
    if (u.length === 0) throw new Error("User not found");
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
    `);

    const achievements = achievementsRes.rows as {
      achievementId: string;
      achievementName: string;
      progress: number;
      dateCompleted: Date;
    }[];

    return {
      achievements,
    };
  }

  async login(
    email: string,
    password: string,
    ip: string,
    isGoogle: boolean = false
  ) {
    email = validateEmail(email);
    const u = await db
      .select()
      .from(user)
      .where(
        and(
          sql`LOWER(${user.userEmail}) = LOWER(${email})`,
          isNull(user.dateDeleted)
        )
      )
      .limit(1);
    if (u.length === 0) throw new Error("User not found");

    if (!isGoogle) {
      const valid = await bcrypt.compare(password, u[0].passwordHash);
      if (!valid) throw new Error("Incorrect password");
    }

    const payload = { userId: u[0].userId, roleId: u[0].roleId };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    const refreshTokenValue = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await db.insert(refreshToken).values({
      userId: u[0].userId,
      token: refreshTokenValue,
      ipAddress: ip,
      expiresAt,
    });

    const isFirstTimeLogin = await db
      .select()
      .from(log)
      .where(
        and(
          eq(log.logDescription, "Logged In To Game"),
          eq(log.userId, u[0].userId)
        )
      );
    await this.addLog(u[0].userId, "Logged In To Game");

    // Daily Diner achievement logic
    const dailyDinerId = process.env.DAILY_DINER_ID as string;
    const [daily] = await db
      .select({
        progress: userAchievement.progress,
        dateCompleted: userAchievement.dateCompleted,
      })
      .from(userAchievement)
      .where(
        and(
          eq(userAchievement.achievementId, dailyDinerId),
          eq(userAchievement.userId, u[0].userId)
        )
      );

    // get last "Logged In To Game" log before today
    const logs = await db
      .select()
      .from(log)
      .where(
        and(
          eq(log.userId, u[0].userId),
          eq(log.logDescription, "Logged In To Game"),
          sql`log_date < NOW()::date`
        )
      )
      .orderBy(desc(log.logDate))
      .limit(1);

    let increment = 1;

    if (logs.length > 0) {
      const lastLogin = new Date(logs[0].logDate);
      const diffDays = Math.floor(
        (new Date().setHours(0, 0, 0, 0) - lastLogin.setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        // consecutive login
        increment = daily.progress + 1;
      } else if (diffDays > 1) {
        // skipped a day, reset progress
        increment = 1;
      } else {
        // already logged in today
        increment = daily.progress;
      }
    }

    // update Daily Diner achievement if needed
    if (increment > daily.progress && increment <= 5) {
      await db
        .update(userAchievement)
        .set({
          progress: increment,
          dateCompleted: increment === 5 ? new Date() : daily.dateCompleted,
        })
        .where(
          and(
            eq(userAchievement.achievementId, dailyDinerId),
            eq(userAchievement.userId, u[0].userId)
          )
        );
    }

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
  `);

    // Overall stats
    const statsRes = await db.execute(sql`
    WITH ach AS (
      SELECT COUNT(*)::int AS total_achievements
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
  `);

    const stats = statsRes.rows.length
      ? (statsRes.rows[0] as {
          totalAttempts: number;
          totalPoints: number;
          totalAchievements: number;
        })
      : { totalAttempts: 0, totalPoints: 0, totalAchievements: 0 };

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
  `);
    const achievements = achievementsRes.rows as {
      achievementId: string;
      achievementName: string;
      progress: number;
      dateCompleted: Date;
    }[];

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
        foodId: string;
        foodName: string;
        highestPoint: number;
        numberOfAttempts: number;
        tutorialUnlock: boolean;
      }[],
      stats,
      achievements,
      isFirstTimeLogin: isFirstTimeLogin.length === 0,
    };
  }

  async profile(userId: string, ip: string) {
    const u = await db
      .select()
      .from(user)
      .where(and(eq(user.userId, userId), isNull(user.dateDeleted)))
      .limit(1);
    if (u.length === 0) throw new Error("User not found");

    const payload = { userId: u[0].userId, roleId: u[0].roleId };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    const refreshTokenValue = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await db.insert(refreshToken).values({
      userId: u[0].userId,
      token: refreshTokenValue,
      ipAddress: ip,
      expiresAt,
    });
    const isFirstTimeLogin = await db
      .select()
      .from(log)
      .where(
        and(
          eq(log.logDescription, "Logged In To Game"),
          eq(log.userId, u[0].userId)
        )
      );

    await this.addLog(u[0].userId, "Logged In To Game");

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
    `);

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
          AND ua.progress >= ach.achievement_requirement
      )
      SELECT
        COUNT(a.attempt_id)::int AS "totalAttempts",
        COALESCE(SUM(a.attempt_point),0)::int AS "totalPoints",
        (SELECT total_achievements FROM ach) AS "totalAchievements"
      FROM attempt a
      JOIN "user" u ON u.user_id = a.user_id
      WHERE a.user_id = ${u[0].userId}
        AND u.date_deleted IS NULL
    `);

    const stats = statsRes.rows.length
      ? (statsRes.rows[0] as {
          totalAttempts: number;
          totalPoints: number;
          totalAchievements: number;
        })
      : { totalAttempts: 0, totalPoints: 0, totalAchievements: 0 };

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
    `);
    const achievements = achievementsRes.rows as {
      achievementId: string;
      achievementName: string;
      progress: number;
      dateCompleted: Date;
    }[];

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
        foodId: string;
        foodName: string;
        highestPoint: number;
        numberOfAttempts: number;
        tutorialUnlock: boolean;
      }[],
      stats,
      achievements,
      isFirstTimeLogin: isFirstTimeLogin.length === 0,
    };
  }

  async refresh(token: string) {
    const row = await db
      .select()
      .from(refreshToken)
      .where(eq(refreshToken.token, token))
      .limit(1);
    if (row.length === 0) throw new Error("Invalid refresh token");
    const tokenRow = row[0];
    if (tokenRow.revokedAt || new Date(tokenRow.expiresAt) < new Date()) {
      throw new Error("Refresh token expired or revoked");
    }
    const payload = { userId: tokenRow.userId };
    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    await this.addLog(tokenRow.userId, "Access token refreshed");
    return { accessToken: newAccessToken };
  }

  async logout(token: string) {
    const row = await db
      .select()
      .from(refreshToken)
      .where(eq(refreshToken.token, token))
      .limit(1);
    if (row.length > 0) {
      await db
        .update(refreshToken)
        .set({ revokedAt: new Date() })
        .where(eq(refreshToken.token, token));
      await this.addLog(row[0].userId, "Logged out from Unity game");
    }
    return { message: "Logged out successfully" };
  }

  async updateUsername(userId: string, newUsername: string) {
    const old = await db
      .select({ userName: user.userName })
      .from(user)
      .where(and(eq(user.userId, userId), isNull(user.dateDeleted)))
      .limit(1);

    const taken = await db
      .select()
      .from(user)
      .where(
        and(
          sql`LOWER(${user.userName}) = LOWER(${newUsername})`,
          isNull(user.dateDeleted),
          sql`LOWER(${user.userName}) != LOWER(${old[0].userName})`
        )
      )
      .limit(1);

    if (taken.length > 0) throw new Error("Username already taken");

    newUsername = validateUsername(newUsername);

    const oldName = old.length ? old[0].userName : "";

    await db
      .update(user)
      .set({ userName: newUsername })
      .where(and(eq(user.userId, userId), isNull(user.dateDeleted)));

    await this.addLog(
      userId,
      `Username changed from ${oldName} to ${newUsername}`
    );
    return { message: "Username updated successfully", userName: newUsername };
  }

  async updateAvatar(userId: string, avatarId: string) {
    const avtr = await db
      .select()
      .from(avatar)
      .where(eq(avatar.avatarId, avatarId))
      .limit(1);
    if (avtr.length < 1) throw new Error("Avatar does not exists");

    await db
      .update(user)
      .set({ avatarId: avatarId })
      .where(and(eq(user.userId, userId), isNull(user.dateDeleted)));

    await this.addLog(userId, `Avatar changed to ${avtr[0].avatarName}`);
    return { message: "Avatar updated successfully" };
  }
}

function validateEmail(email: string) {
  if (typeof email !== "string") throw new Error("Invalid email");

  const e = email.trim().toLowerCase();

  if (e.length < 6 || e.length > 254)
    throw new Error("Email length is invalid");

  const re = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/;

  if (!re.test(e)) throw new Error("Invalid email format");

  if (e.includes("..") || e.startsWith(".") || e.endsWith("."))
    throw new Error("Invalid email format");

  return e;
}
function validateUsername(username: string) {
  if (typeof username !== "string") throw new Error("Invalid username");

  const u = username.trim();

  if (u.length < 3 || u.length > 32)
    throw new Error("Username must be between 3 and 32 characters");

  if (u.includes(" ")) throw new Error("Username must not contain spaces");

  const allowed = /^[A-Za-z0-9._-]+$/;
  if (!allowed.test(u)) throw new Error("Username contains invalid characters");

  return u;
}
