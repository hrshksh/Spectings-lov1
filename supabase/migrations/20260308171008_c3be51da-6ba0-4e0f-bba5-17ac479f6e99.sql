
-- Add unique index on lowercase company name to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS companies_name_unique ON public.companies (lower(name));

-- Allow all authenticated users to see companies (shared across orgs)
DROP POLICY IF EXISTS "Org members can view their companies" ON public.companies;

CREATE POLICY "Authenticated users can view tracked companies"
ON public.companies
FOR SELECT
TO authenticated
USING (true);
