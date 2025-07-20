import { pgTable, uuid, text } from "drizzle-orm/pg-core";

export const role = pgTable('role', {
  roleId: uuid('role_id').primaryKey(),
  roleName: text('role_name').notNull()
});