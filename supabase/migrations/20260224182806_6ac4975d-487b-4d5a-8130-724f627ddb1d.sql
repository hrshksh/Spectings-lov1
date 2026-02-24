
-- Add prospect_type column to leads table
ALTER TABLE public.leads ADD COLUMN prospect_type text DEFAULT 'sales';

-- Add index for filtering
CREATE INDEX idx_leads_prospect_type ON public.leads (prospect_type);
