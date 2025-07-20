import { pgTable, uuid, integer, text, timestamp } from "drizzle-orm/pg-core";
import { user } from './user';
import { food } from './food';

export const attempt = pgTable('attempt', {
  attemptId: uuid('attempt_id').primaryKey(),
  userId: uuid('user_id').references(() => user.userId).notNull(),
  foodId: uuid('food_id').references(() => food.foodId).notNull(),
  attemptPoint: integer('attempt_point').notNull(),
  attemptDate: timestamp('attempt_date', { withTimezone: true }).notNull(),
  attemptDuration: timestamp('attempt_duration', { withTimezone: true }).notNull(),
  attemptType: text('attempt_type').notNull()
});