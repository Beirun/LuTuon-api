import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { role } from './role';
import { avatar } from './avatar';

export const user = pgTable('user', {
  userId: uuid('user_id').primaryKey(),
  roleId: uuid('role_id').references(() => role.roleId).notNull(),
  userEmail: text('user_email').notNull(),
  userName: text('user_name').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  userDob: timestamp('user_dob', { withTimezone: true }).notNull(),
  avatarId: uuid('avatar_id').references(() => avatar.avatarId).notNull(),
  dateCreated: timestamp('date_created', { withTimezone: true }).notNull(),
  dateUpdated: timestamp('date_updated', { withTimezone: true }),
  dateDeleted: timestamp('date_deleted', { withTimezone: true }),
});
