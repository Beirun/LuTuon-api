import { pgTable, uuid, text } from "drizzle-orm/pg-core";

export const food = pgTable('food', {
  foodId: uuid('food_id').primaryKey(),
  foodName: text('food_name').notNull(),
  foodDescription: text('food_description').notNull()
});
