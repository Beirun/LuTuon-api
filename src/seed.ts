import "dotenv/config";
import { db } from "./config/db";
import { v4 as uuidv4 } from "uuid";
import { achievement } from "./schema/achievement";

import { user } from "./schema/user";
import { userAchievement } from "./schema/userAchievement";
import { and, eq } from "drizzle-orm";

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
            eq(userAchievement.achievementId, a.achievementId)
          )
        );

      if (exists.length === 0) {
        await db.insert(userAchievement).values({
          userId: u.userId,
          achievementId: a.achievementId,
          progress: 0,
          dateCompleted: new Date()
        });
      }
    }
  }
}


export async function seed() {
  try {
    const achievements = [
  {
    achievementId: uuidv4(),
    achievementName: "First Flame",
    achievementDescription: "Successfully cook your very first Filipino dish in Standard Mode.",
    achievementRequirement: 1
  },
  {
    achievementId: uuidv4(),
    achievementName: "Perfect Plating",
    achievementDescription: "Achieve a perfect score on any dish by completing all steps flawlessly.",
    achievementRequirement: 100
  },
  {
    achievementId: uuidv4(),
    achievementName: "Novice Chef",
    achievementDescription: "Finish the first 2 dishes in Standard Mode.",
    achievementRequirement: 2
  },
  {
    achievementId: uuidv4(),
    achievementName: "Master Chef",
    achievementDescription: "Finish all available dishes in Standard Mode.",
    achievementRequirement: 4
  },
  {
    achievementId: uuidv4(),
    achievementName: "The Perfectionist",
    achievementDescription: "Achieve perfect score for a dish five times.",
    achievementRequirement: 5
  },
  {
    achievementId: uuidv4(),
    achievementName: "Daily Diner",
    achievementDescription: "Log in and cook at least one dish for five consecutive days.",
    achievementRequirement: 5
  },
  {
    achievementId: uuidv4(),
    achievementName: "Curious Cook",
    achievementDescription: "Replay a tutorial lesson to practice your skills.",
    achievementRequirement: 1
  },
  {
    achievementId: uuidv4(),
    achievementName: "Getting the Hang of it",
    achievementDescription: "Complete all tutorial lessons successfully.",
    achievementRequirement: 4
  }
];

    await db.insert(achievement).values(achievements);
    console.log("✅ Achievements seeded");

    process.exit(0);
  } catch (e) {
    console.error("❌ Seeding failed", e);
    process.exit(1);
  }
}


