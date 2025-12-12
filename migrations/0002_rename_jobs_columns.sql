-- Rename columns in jobs table to match schema
ALTER TABLE "jobs" RENAME COLUMN "type" TO "employment_type";
ALTER TABLE "jobs" RENAME COLUMN "experience" TO "experience_level";
ALTER TABLE "jobs" RENAME COLUMN "applications" TO "applications_count";

-- Update employment_type check constraint if it exists
ALTER TABLE "jobs" DROP CONSTRAINT IF EXISTS "jobs_type_check";
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_employment_type_check" CHECK (employment_type = ANY (ARRAY['full-time'::text, 'part-time'::text, 'contract'::text, 'freelance'::text, 'internship'::text]));

-- Update experience_level check constraint if it exists  
ALTER TABLE "jobs" DROP CONSTRAINT IF EXISTS "jobs_experience_check";
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_experience_level_check" CHECK (experience_level = ANY (ARRAY['entry'::text, 'mid'::text, 'senior'::text, 'lead'::text]));

-- Ensure is_pro column exists (should already exist from migration 0001, but adding check)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = 'is_pro'
    ) THEN
        ALTER TABLE "jobs" ADD COLUMN "is_pro" boolean DEFAULT false;
    END IF;
END $$;

