-- Create resumes table
CREATE TABLE IF NOT EXISTS "resumes" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" varchar(255) NOT NULL,
  "summary" text,
  "basic_info" jsonb,
  "skills_and_languages" jsonb,
  "portfolio" jsonb,
  "education" jsonb,
  "work_history" jsonb DEFAULT '[]'::jsonb,
  "additional_info" jsonb,
  "visibility" varchar(50) DEFAULT 'private',
  "template_style" varchar(50) DEFAULT 'modern',
  "is_default" boolean DEFAULT false,
  "file_url" varchar(500),
  "file_name" varchar(255),
  "file_size" integer,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "is_public" boolean DEFAULT true
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS "resumes_user_id_idx" ON "resumes"("user_id");

-- Create index on is_default for faster default resume lookups
CREATE INDEX IF NOT EXISTS "resumes_is_default_idx" ON "resumes"("is_default");

