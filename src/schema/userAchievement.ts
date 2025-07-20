import { pgTable, uuid, timestamp, integer, primaryKey } from "drizzle-orm/pg-core";
import { user } from './user';
import { achievement } from './achievement';

export const userAchievement = pgTable('user_achievement', {
  userId: uuid('user_id').references(() => user.userId).notNull(),
  achievementId: uuid('achievement_id').references(() => achievement.achievementId).notNull(),
  progress: integer('progress').notNull(),
  dateCompleted: timestamp('date_completed', { withTimezone: true }).notNull()
}, (t) => ({
  pk: primaryKey(t.userId, t.achievementId)
}));