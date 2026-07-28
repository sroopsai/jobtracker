CREATE TABLE "job_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"company" text NOT NULL,
	"job_title" text NOT NULL,
	"status" text DEFAULT 'Applied' NOT NULL,
	"application_date" text NOT NULL,
	"job_url" text,
	"location" text,
	"salary_range" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "job_applications" USING btree ("user_id");