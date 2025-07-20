import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { user } from './user';

export const log = pgTable('log', {
    logId: uuid('log_id').primaryKey(),
    userId: uuid('user_id').references(() => user.userId).notNull(),
    logDescription: text('log_description').notNull(),
    logDate: timestamp('log_date', { withTimezone: true }).notNull()
});
