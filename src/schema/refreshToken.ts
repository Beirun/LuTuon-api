import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { user } from './user';

export const refreshToken = pgTable('refresh_token', {
    tokenId: uuid('token_id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => user.userId, { onDelete: 'cascade' }).notNull(),
    token: text('token').notNull(),
    ipAddress: text('ip_address').notNull(),
    issuedAt: timestamp('issued_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true })
});
