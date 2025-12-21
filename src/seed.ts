import "dotenv/config";
import { db } from "./config/db";
import { v4 as uuidv4 } from "uuid";
import { achievement } from "./schema/achievement";

import { user } from "./schema/user";
import { userAchievement } from "./schema/userAchievement";
import { and, eq } from "drizzle-orm";
import { food } from "./schema/food";

export async function seedUserAchievements() {
  const users = await db.select().from(user);
  const achievements = await db.select().from(achievement);
  if (users.length === 0 || achievements.length === 0) return;

  for (const u of users) {
    for (const a of achievements) {
      const exists = await db
        .select()
        .from(userAchievement)
        .where(
          and(
            eq(userAchievement.userId, u.userId),
            eq(userAchievement.achievementId, a.achievementId),
          ),
        );

      if (exists.length === 0) {
        await db.insert(userAchievement).values({
          userId: u.userId,
          achievementId: a.achievementId,
          progress: 0,
          dateCompleted: new Date(),
        });
      }
    }
  }
}

export async function seed() {
  try {
    const foods = [
      {
        foodId: uuidv4(),
        foodName: "Garlic Butter Shrimp",
        foodDescription:
          "Shrimp sautéed in rich garlic butter with a hint of lemon, tender and juicy with a fragrant, savory finish.",
      },
      {
        foodId: uuidv4(),
        foodName: "Sinuglaw",
        foodDescription:
          "A mix of grilled pork belly and fresh fish cured in vinegar and calamansi, combined with onions and chili for a smoky, tangy taste.",
      },
    ];

    await db.insert(food).values(foods);
    console.log("✅ food seeded");

    process.exit(0);
  } catch (e) {
    console.error("❌ Seeding failed", e);
    process.exit(1);
  }
}

seed();
