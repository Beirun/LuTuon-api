import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { user } from './user';

export const notification = pgTable('notification', {
  notificationId: uuid('notification_id').primaryKey(),
  userId: uuid('user_id').references(() => user.userId).notNull(),
  notificationTitle: text('notification_title').notNull(),
  notificationMessage: text('notification_message').notNull(),
  notificationStatus: text('notification_status').notNull(),
  notificationDate: timestamp('notification_date', { withTimezone: true }).notNull()
});
