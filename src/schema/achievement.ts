import { pgTable, uuid, text, integer } from "drizzle-orm/pg-core";

export const achievement = pgTable('achievement', {
  achievementId: uuid('achievement_id').primaryKey(),
  achievementName: text('achievement_name').notNull(),
  achievementDescription: text('achievement_description').notNull(),
  achievementRequirement: integer('achievement_requirement').notNull()
});
