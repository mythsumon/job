-- Migration: Add company info fields to companies table
-- Date: 2024-12-26

-- Add logo related fields
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_format TEXT DEFAULT 'webp';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_size INTEGER;

-- Add contact information fields  
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address TEXT;

-- Add social media fields
ALTER TABLE companies ADD COLUMN IF NOT EXISTS linkedin TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS facebook TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS twitter TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS instagram TEXT;

-- Add company culture fields
ALTER TABLE companies ADD COLUMN IF NOT EXISTS mission TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS vision TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS values JSONB;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
CREATE INDEX IF NOT EXISTS idx_companies_phone ON companies(phone);
CREATE INDEX IF NOT EXISTS idx_companies_logo_format ON companies(logo_format);

-- Update timestamps for all companies to track when schema was updated
UPDATE companies SET updated_at = NOW() WHERE updated_at IS NULL; 