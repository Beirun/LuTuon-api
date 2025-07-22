CREATE TABLE "achievement" (
	"achievement_id" uuid PRIMARY KEY NOT NULL,
	"achievement_name" text NOT NULL,
	"achievement_description" text NOT NULL,
	"achievement_requirement" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alternative" (
	"alt_id" uuid PRIMARY KEY NOT NULL,
	"alt_name" text NOT NULL,
	"alt_type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attempt" (
	"attempt_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"food_id" uuid NOT NULL,
	"attempt_point" integer NOT NULL,
	"attempt_date" timestamp with time zone NOT NULL,
	"attempt_duration" timestamp with time zone NOT NULL,
	"attempt_type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "avatar" (
	"avatar_id" uuid PRIMARY KEY NOT NULL,
	"avatar_name" text NOT NULL,
	"avatar_path" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"feedback_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"feedback_message" text NOT NULL,
	"feedback_date" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food" (
	"food_id" uuid PRIMARY KEY NOT NULL,
	"food_name" text NOT NULL,
	"food_description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingredient" (
	"ingredient_id" uuid PRIMARY KEY NOT NULL,
	"ingredient_name" text NOT NULL,
	"ingredient_type" text NOT NULL,
	"alt_id" uuid
);
--> statement-breakpoint
CREATE TABLE "log" (
	"log_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"log_description" text NOT NULL,
	"log_date" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"notification_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"notification_title" text NOT NULL,
	"notification_message" text NOT NULL,
	"notification_status" text NOT NULL,
	"notification_date" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preference" (
	"preference_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"sfx_volume" integer NOT NULL,
	"music_volume" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe" (
	"food_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"quantity" numeric(18, 2) NOT NULL,
	"unit" text NOT NULL,
	CONSTRAINT "recipe_food_id_ingredient_id_pk" PRIMARY KEY("food_id","ingredient_id")
);
--> statement-breakpoint
CREATE TABLE "refresh_token" (
	"token_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"ip_address" text NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "reset_password" (
	"code_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code" text NOT NULL,
	"ip_address" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role" (
	"role_id" uuid PRIMARY KEY NOT NULL,
	"role_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"role_id" uuid NOT NULL,
	"user_email" text NOT NULL,
	"user_name" text NOT NULL,
	"password_hash" text NOT NULL,
	"user_dob" timestamp with time zone NOT NULL,
	"date_created" timestamp with time zone NOT NULL,
	"date_updated" timestamp with time zone NOT NULL,
	"avatar_id" uuid NOT NULL,
	CONSTRAINT "user_user_email_unique" UNIQUE("user_email"),
	CONSTRAINT "user_user_name_unique" UNIQUE("user_name")
);
--> statement-breakpoint
CREATE TABLE "user_achievement" (
	"user_id" uuid NOT NULL,
	"achievement_id" uuid NOT NULL,
	"progress" integer NOT NULL,
	"date_completed" timestamp with time zone NOT NULL,
	CONSTRAINT "user_achievement_user_id_achievement_id_pk" PRIMARY KEY("user_id","achievement_id")
);
--> statement-breakpoint
ALTER TABLE "attempt" ADD CONSTRAINT "attempt_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt" ADD CONSTRAINT "attempt_food_id_food_food_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."food"("food_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient" ADD CONSTRAINT "ingredient_alt_id_alternative_alt_id_fk" FOREIGN KEY ("alt_id") REFERENCES "public"."alternative"("alt_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log" ADD CONSTRAINT "log_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preference" ADD CONSTRAINT "preference_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe" ADD CONSTRAINT "recipe_food_id_food_food_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."food"("food_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe" ADD CONSTRAINT "recipe_ingredient_id_ingredient_ingredient_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredient"("ingredient_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reset_password" ADD CONSTRAINT "reset_password_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_role_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("role_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_avatar_id_avatar_avatar_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."avatar"("avatar_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_achievement_id_achievement_achievement_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievement"("achievement_id") ON DELETE no action ON UPDATE no action;