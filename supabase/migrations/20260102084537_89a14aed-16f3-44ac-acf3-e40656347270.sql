
-- Add is_tracked field to companies table
ALTER TABLE public.companies ADD COLUMN is_tracked boolean NOT NULL DEFAULT false;

-- Update existing companies to be tracked (since they were added as competitors)
UPDATE public.companies SET is_tracked = true WHERE is_tracked = false;
