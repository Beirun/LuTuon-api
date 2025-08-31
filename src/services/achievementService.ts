// services/achievementService.ts
import { db } from "../config/db";
import { achievement } from "../schema/achievement";
import { userAchievement } from "../schema/userAchievement";
import { user } from "../schema/user";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export class AchievementService {
  async getAllAchievements() {
    try {
      const rows = await db
        .select({
          achievementId: achievement.achievementId,
          achievementName: achievement.achievementName,
          achievementDescription: achievement.achievementDescription,
          achievementRequirement: achievement.achievementRequirement,
          userId: userAchievement.userId,
          progress: userAchievement.progress,
          dateCompleted: userAchievement.dateCompleted,
          username: user.userName,
          userEmail: user.userEmail,
        })
        .from(userAchievement)
        .leftJoin(user, eq(userAchievement.userId, user.userId))
        .leftJoin(achievement, eq(userAchievement.achievementId, achievement.achievementId));

      return rows;
    } catch (e) {
      throw new Error("Failed to fetch achievements: " + (e as Error).message);
    }
  }

  async getAchievementsByUser(userId: string) {
    try {
      const rows = await db
        .select({
          achievementId: achievement.achievementId,
          achievementName: achievement.achievementName,
          achievementDescription: achievement.achievementDescription,
          achievementRequirement: achievement.achievementRequirement,
          progress: userAchievement.progress,
          dateCompleted: userAchievement.dateCompleted,
        })
        .from(userAchievement)
        .leftJoin(achievement, eq(userAchievement.achievementId, achievement.achievementId))
        .where(eq(userAchievement.userId, userId));

      return rows;
    } catch (e) {
      throw new Error("Failed to fetch user achievements: " + (e as Error).message);
    }
  }

  async addAchievement(data: {
    userId: string;
    achievementId: string;
    progress: number;
    dateCompleted: Date;
  }) {
    try {
      await db.insert(userAchievement).values({
        userId: data.userId,
        achievementId: data.achievementId,
        progress: data.progress,
        dateCompleted: data.dateCompleted,
      });
      return data;
    } catch (e) {
      throw new Error("Failed to add achievement: " + (e as Error).message);
    }
  }

  async updateAchievement(data: {
    userId: string;
    achievementId: string;
    progress: number;
    dateCompleted: Date;
  }) {
    try {
      await db
        .update(userAchievement)
        .set({
          progress: data.progress,
          dateCompleted: data.dateCompleted,
        })
        .where(and(eq(userAchievement.userId, data.userId), eq(userAchievement.achievementId, data.achievementId)));

      return data;
    } catch (e) {
      throw new Error("Failed to update achievement: " + (e as Error).message);
    }
  }
}

export const achievementService = new AchievementService();
