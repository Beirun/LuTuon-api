// services/attemptService.ts
import { db } from "../config/db";
import { attempt } from "../schema/attempt";
import { user } from "../schema/user";
import { food } from "../schema/food";
import { log } from "../schema/log";
import { desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

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
      const [f] = await db.select().from(food).where(eq(food.foodId,data.foodId)).limit(1);
      await this.addLog(data.userId, `Played ${data.attemptType} Mode of ${f.foodName}`);
      return { attemptId: newId, ...data };
    } catch (e) {
      throw new Error("Failed to create attempt: " + (e as Error).message);
    }
  }
}

export const attemptService = new AttemptService();
