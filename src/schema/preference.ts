import { pgTable, uuid, integer } from "drizzle-orm/pg-core";
import { user } from './user';

export const preference = pgTable('preference', {
  preferenceId: uuid('preference_id').primaryKey(),
  userId: uuid('user_id').references(() => user.userId).notNull(),
  sfxVolume: integer('sfx_volume').notNull(),
  musicVolume: integer('music_volume').notNull()
});

