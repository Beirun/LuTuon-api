import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { user } from './user';

export const resetPassword = pgTable('reset_password', {
  codeId: uuid('code_id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => user.userId, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull(),
  ipAddress: text('ip_address'),
  requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isUsed: boolean('is_used').default(false).notNull()
});
