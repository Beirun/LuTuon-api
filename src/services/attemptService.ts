// services/attemptService.ts
import { db } from "../config/db";
import { attempt } from "../schema/attempt";
import { user } from "../schema/user";
import { food } from "../schema/food";
import { log } from "../schema/log";
import { and, desc, eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { userAchievement } from "../schema/userAchievement";
import dotenv from "dotenv";
import { achievement } from "../schema/achievement";

dotenv.config();
export class AttemptService {
  private async addLog(userId: string, description: string) {
    await db.insert(log).values({
      logId: uuidv4(),
      userId,
      logDescription: description,
      logDate: new Date(),
    });
  }
  async getAllAttempts() {
    try {
      const rows = await db
        .select({
          attemptId: attempt.attemptId,
          attemptPoint: attempt.attemptPoint,
          attemptDate: attempt.attemptDate,
          attemptDuration: attempt.attemptDuration,
          attemptType: attempt.attemptType,
          userName: user.userName,
          userEmail: user.userEmail,
          foodName: food.foodName,
        })
        .from(attempt)
        .leftJoin(user, eq(attempt.userId, user.userId))
        .leftJoin(food, eq(attempt.foodId, food.foodId))
        .orderBy(desc(attempt.attemptDate));

      return rows;
    } catch (e) {
      throw new Error("Failed to fetch attempts: " + (e as Error).message);
    }
  }
  async getAllAttemptByUserId(userId: string) {
    try {
      const rows = await db
        .select({
          attemptId: attempt.attemptId,
          attemptPoint: attempt.attemptPoint,
          attemptDate: attempt.attemptDate,
          attemptDuration: attempt.attemptDuration,
          attemptType: attempt.attemptType,
          userName: user.userName,
          userEmail: user.userEmail,
          foodName: food.foodName,
        })
        .from(attempt)
        .leftJoin(user, eq(attempt.userId, user.userId))
        .leftJoin(food, eq(attempt.foodId, food.foodId))
        .where(eq(user.userId, userId))
        .orderBy(desc(attempt.attemptDate));

      return rows;
    } catch (e) {
      throw new Error("Failed to fetch attempts: " + (e as Error).message);
    }
  }

  async createAttempt(data: {
    userId: string;
    foodId: string;
    attemptPoint: number;
    attemptDate: Date;
    attemptDuration: Date;
    attemptType: string;
  }) {
    try {
      const newId = uuidv4();
      await db.insert(attempt).values({
        attemptId: newId,
        userId: data.userId,
        foodId: data.foodId,
        attemptPoint: data.attemptPoint,
        attemptDate: data.attemptDate,
        attemptDuration: data.attemptDuration,
        attemptType: data.attemptType,
      });

      const [f] = await db
        .select()
        .from(food)
        .where(eq(food.foodId, data.foodId))
        .limit(1);

      await this.addLog(
        data.userId,
        `Played ${data.attemptType} Mode of ${f.foodName}`
      );

      await this.checkAchievement(data.attemptPoint, data.userId);
      return { attemptId: newId, ...data };
    } catch (e) {
      throw new Error("Failed to create attempt: " + (e as Error).message);
    }
  }

  async checkAchievement(point: number, userId: string) {
    // First Flame: successfully cook first dish in Standard Mode with perfect score
    if (point === 100) {
      const [firstFlame] = await db
        .select({
          achievementId: userAchievement.achievementId,
          achievementRequirement: achievement.achievementRequirement,
          progress: userAchievement.progress,
        })
        .from(userAchievement)
        .leftJoin(
          achievement,
          eq(userAchievement.achievementId, achievement.achievementId)
        )
        .where(
          and(
            eq(
              userAchievement.achievementId,
              process.env.FIRST_FLAME_ID as string
            ),
            eq(userAchievement.userId, userId)
          )
        );

      if (firstFlame.progress < firstFlame.achievementRequirement!) {
        await db
          .update(userAchievement)
          .set({ progress: 1, dateCompleted: new Date() })
          .where(
            and(
              eq(
                userAchievement.achievementId,
                process.env.FIRST_FLAME_ID as string
              ),
              eq(userAchievement.userId, userId)
            )
          );
      }
    }

    // The Perfectionist: perfect score in Standard Mode 5 times
    // The Perfectionist: perfect score in Standard Mode 5 times
    const [perf] = await db
      .select({
        progress: userAchievement.progress,
        dateCompleted: userAchievement.dateCompleted,
      })
      .from(userAchievement)
      .where(
        and(
          eq(
            userAchievement.achievementId,
            process.env.THE_PERFECTIONIST_ID as string
          ),
          eq(userAchievement.userId, userId)
        )
      );

    // count number of perfect Standard Mode attempts
    const perfectAttempts = await db
      .select()
      .from(attempt)
      .where(
        and(
          eq(attempt.userId, userId),
          eq(attempt.attemptType, "Standard"),
          eq(attempt.attemptPoint, 100)
        )
      );

    const perfProgress = Math.min(perfectAttempts.length, 5);

    if (perf.progress < perfProgress) {
      await db
        .update(userAchievement)
        .set({
          progress: perfProgress,
          dateCompleted: perfProgress === 5 ? new Date() : perf.dateCompleted,
        })
        .where(
          and(
            eq(
              userAchievement.achievementId,
              process.env.THE_PERFECTIONIST_ID as string
            ),
            eq(userAchievement.userId, userId)
          )
        );
    }

    // Perfect Plating: perfect score on any dish
    if (point === 100) {
      const [perfectPlating] = await db
        .select({ progress: userAchievement.progress })
        .from(userAchievement)
        .where(
          and(
            eq(
              userAchievement.achievementId,
              process.env.PERFECT_PLATING_ID as string
            ),
            eq(userAchievement.userId, userId)
          )
        );

      if (perfectPlating.progress < 100) {
        await db
          .update(userAchievement)
          .set({ progress: 100, dateCompleted: new Date() })
          .where(
            and(
              eq(
                userAchievement.achievementId,
                process.env.PERFECT_PLATING_ID as string
              ),
              eq(userAchievement.userId, userId)
            )
          );
      }
    }

    // Novice Chef: complete first 2 dishes in Standard Mode
    const standardAttempts = await db
      .select()
      .from(attempt)
      .where(
        and(eq(attempt.userId, userId), eq(attempt.attemptType, "Standard"))
      );

    const [novice] = await db
      .select({ progress: userAchievement.progress })
      .from(userAchievement)
      .where(
        and(
          eq(
            userAchievement.achievementId,
            process.env.NOVICE_CHEF_ID as string
          ),
          eq(userAchievement.userId, userId)
        )
      );

    if (novice.progress < 2 && standardAttempts.length >= 2) {
      await db
        .update(userAchievement)
        .set({ progress: 2, dateCompleted: new Date() })
        .where(
          and(
            eq(
              userAchievement.achievementId,
              process.env.NOVICE_CHEF_ID as string
            ),
            eq(userAchievement.userId, userId)
          )
        );
    }

    // Master Chef: progress based on unique Standard Mode dishes completed
    const [master] = await db
      .select({
        progress: userAchievement.progress,
        dateCompleted: userAchievement.dateCompleted,
      })
      .from(userAchievement)
      .where(
        and(
          eq(
            userAchievement.achievementId,
            process.env.MASTER_CHEF_ID as string
          ),
          eq(userAchievement.userId, userId)
        )
      );

    // count unique foodId in Standard Mode
    const completedDishes = await db
      .selectDistinct()
      .from(attempt)
      .where(
        and(eq(attempt.userId, userId), eq(attempt.attemptType, "Standard"))
      );

    const totalDishes = await db.select().from(food);

    const newProgress = Math.min(completedDishes.length, totalDishes.length);

    if (master.progress < newProgress) {
      await db
        .update(userAchievement)
        .set({
          progress: newProgress,
          dateCompleted:
            newProgress === totalDishes.length
              ? new Date()
              : master.dateCompleted,
        })
        .where(
          and(
            eq(
              userAchievement.achievementId,
              process.env.MASTER_CHEF_ID as string
            ),
            eq(userAchievement.userId, userId)
          )
        );
    }

    // Curious Cook: replay a tutorial (same Tutorial twice)
    const [curious] = await db
      .select({
        progress: userAchievement.progress,
        dateCompleted: userAchievement.dateCompleted,
      })
      .from(userAchievement)
      .where(
        and(
          eq(
            userAchievement.achievementId,
            process.env.CURIOUS_COOK_ID as string
          ),
          eq(userAchievement.userId, userId)
        )
      );

    // count tutorial attempts grouped by foodId
    const tutorialAttempts = await db
      .select({
        foodId: attempt.foodId,
        count: sql`COUNT(*)`,
      })
      .from(attempt)
      .where(
        and(eq(attempt.userId, userId), eq(attempt.attemptType, "Tutorial"))
      )
      .groupBy(attempt.foodId);

    // check if any tutorial was played twice
    const replayed = tutorialAttempts.some((t) => Number(t.count) >= 2);

    if (curious.progress < 1 && replayed) {
      await db
        .update(userAchievement)
        .set({ progress: 1, dateCompleted: new Date() })
        .where(
          and(
            eq(
              userAchievement.achievementId,
              process.env.CURIOUS_COOK_ID as string
            ),
            eq(userAchievement.userId, userId)
          )
        );
    }

    // Getting the Hang of It: complete all Tutorial dishes
    const [gettingHang] = await db
      .select({
        progress: userAchievement.progress,
        dateCompleted: userAchievement.dateCompleted,
      })
      .from(userAchievement)
      .where(
        and(
          eq(
            userAchievement.achievementId,
            process.env.GETTING_THE_HANG_OF_IT_ID as string
          ),
          eq(userAchievement.userId, userId)
        )
      );

    // get all foods that have a Tutorial mode
    const tutorialFoods = await db.select({ foodId: food.foodId }).from(food);

    // count how many tutorial foods the user has completed with perfect score
    const completedTutorials = await db
      .select({foodId: attempt.foodId})
      .from(attempt)
      .where(
        and(
          eq(attempt.userId, userId),
          eq(attempt.attemptType, "Tutorial"),
          eq(attempt.attemptPoint, 100)
        )
      )
      .groupBy(attempt.foodId);

    const tutorialProgress = Math.min(
      completedTutorials.length,
      tutorialFoods.length
    );

    if (gettingHang.progress < tutorialProgress) {
      await db
        .update(userAchievement)
        .set({
          progress: tutorialProgress,
          dateCompleted:
            tutorialProgress === tutorialFoods.length
              ? new Date()
              : gettingHang.dateCompleted,
        })
        .where(
          and(
            eq(
              userAchievement.achievementId,
              process.env.GETTING_THE_HANG_OF_IT_ID as string
            ),
            eq(userAchievement.userId, userId)
          )
        );
    }
  }
}
export const attemptService = new AttemptService();
