import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { user } from './user';

export const feedback = pgTable('feedback', {
  feedbackId: uuid('feedback_id').primaryKey(),
  userId: uuid('user_id').references(() => user.userId).notNull(),
  feedbackMessage: text('feedback_message').notNull(),
  feedbackDate: timestamp('feedback_date', { withTimezone: true }).notNull()
});