ALTER TABLE "user" ALTER COLUMN "date_updated" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "date_deleted" timestamp with time zone;