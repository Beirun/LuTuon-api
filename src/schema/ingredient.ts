import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { alternative } from './alternative';

export const ingredient = pgTable('ingredient', {
  ingredientId: uuid('ingredient_id').primaryKey(),
  ingredientName: text('ingredient_name').notNull(),
  ingredientType: text('ingredient_type').notNull(),
  altId: uuid('alt_id').references(() => alternative.altId)
});
