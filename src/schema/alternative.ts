import { pgTable, uuid, text } from "drizzle-orm/pg-core";

export const alternative = pgTable('alternative', {
  altId: uuid('alt_id').primaryKey(),
  altName: text('alt_name').notNull(),
  altType: text('alt_type').notNull()
});