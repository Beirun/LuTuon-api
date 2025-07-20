import { pgTable, uuid, text } from "drizzle-orm/pg-core";

export const avatar = pgTable('avatar', {
  avatarId: uuid('avatar_id').primaryKey(),
  avatarName: text('avatar_name').notNull(),
  avatarPath: text('avatar_path').notNull()
});
