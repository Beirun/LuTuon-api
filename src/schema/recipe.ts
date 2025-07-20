import { pgTable, uuid, decimal, text, primaryKey } from "drizzle-orm/pg-core";
import { food } from './food';
import { ingredient } from './ingredient';

export const recipe = pgTable('recipe', {
  foodId: uuid('food_id').references(() => food.foodId).notNull(),
  ingredientId: uuid('ingredient_id').references(() => ingredient.ingredientId).notNull(),
  quantity: decimal('quantity', { precision: 18, scale: 2 }).notNull(),
  unit: text('unit').notNull()
}, (t) => ({
  pk: primaryKey(t.foodId, t.ingredientId)
}));
