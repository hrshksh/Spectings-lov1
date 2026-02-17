
-- Helper function: get user's organization_id (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Add organization_id to core tables
ALTER TABLE public.companies ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.people ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.leads ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.tasks ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.raw_evidence ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.company_events ADD COLUMN organization_id uuid REFERENCES public.organizations(id);

-- Performance indexes on organization_id (B-tree for equality lookups)
CREATE INDEX idx_companies_org_id ON public.companies(organization_id);
CREATE INDEX idx_people_org_id ON public.people(organization_id);
CREATE INDEX idx_leads_org_id ON public.leads(organization_id);
CREATE INDEX idx_tasks_org_id ON public.tasks(organization_id);
CREATE INDEX idx_raw_evidence_org_id ON public.raw_evidence(organization_id);
CREATE INDEX idx_company_events_org_id ON public.company_events(organization_id);

-- Composite indexes for common query patterns
CREATE INDEX idx_tasks_org_status ON public.tasks(organization_id, status);
CREATE INDEX idx_leads_org_status ON public.leads(organization_id, status);
CREATE INDEX idx_raw_evidence_org_status ON public.raw_evidence(organization_id, status);
CREATE INDEX idx_companies_org_tracked ON public.companies(organization_id, is_tracked);
CREATE INDEX idx_company_events_org_type ON public.company_events(organization_id, event_type);
CREATE INDEX idx_people_org_company ON public.people(organization_id, company);

-- Index on organization_members for fast org lookups
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(organization_id);

-- Drop existing policies and recreate with org-scoping

-- COMPANIES
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can view companies" ON public.companies;

CREATE POLICY "Admins can manage companies"
ON public.companies FOR ALL
USING (is_admin(auth.uid()) AND (organization_id IS NULL OR organization_id = get_user_org_id(auth.uid())))
WITH CHECK (is_admin(auth.uid()) AND (organization_id = get_user_org_id(auth.uid())));

CREATE POLICY "Org members can view their companies"
ON public.companies FOR SELECT
USING (organization_id = get_user_org_id(auth.uid()));

-- PEOPLE
DROP POLICY IF EXISTS "Admins can manage people" ON public.people;
DROP POLICY IF EXISTS "Admins can view people" ON public.people;

CREATE POLICY "Admins can manage people"
ON public.people FOR ALL
USING (is_admin(auth.uid()) AND (organization_id IS NULL OR organization_id = get_user_org_id(auth.uid())))
WITH CHECK (is_admin(auth.uid()) AND (organization_id = get_user_org_id(auth.uid())));

CREATE POLICY "Org members can view their people"
ON public.people FOR SELECT
USING (organization_id = get_user_org_id(auth.uid()));

-- LEADS
DROP POLICY IF EXISTS "Admins can manage leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view leads" ON public.leads;

CREATE POLICY "Admins can manage leads"
ON public.leads FOR ALL
USING (is_admin(auth.uid()) AND (organization_id IS NULL OR organization_id = get_user_org_id(auth.uid())))
WITH CHECK (is_admin(auth.uid()) AND (organization_id = get_user_org_id(auth.uid())));

CREATE POLICY "Org members can view their leads"
ON public.leads FOR SELECT
USING (organization_id = get_user_org_id(auth.uid()));

-- TASKS
DROP POLICY IF EXISTS "Admins can manage tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can view tasks" ON public.tasks;

CREATE POLICY "Admins can manage tasks"
ON public.tasks FOR ALL
USING (is_admin(auth.uid()) AND (organization_id IS NULL OR organization_id = get_user_org_id(auth.uid())))
WITH CHECK (is_admin(auth.uid()) AND (organization_id = get_user_org_id(auth.uid())));

CREATE POLICY "Org members can view their tasks"
ON public.tasks FOR SELECT
USING (organization_id = get_user_org_id(auth.uid()));

-- RAW EVIDENCE
DROP POLICY IF EXISTS "Admins can manage evidence" ON public.raw_evidence;
DROP POLICY IF EXISTS "Admins can view evidence" ON public.raw_evidence;

CREATE POLICY "Admins can manage evidence"
ON public.raw_evidence FOR ALL
USING (is_admin(auth.uid()) AND (organization_id IS NULL OR organization_id = get_user_org_id(auth.uid())))
WITH CHECK (is_admin(auth.uid()) AND (organization_id = get_user_org_id(auth.uid())));

CREATE POLICY "Org members can view their evidence"
ON public.raw_evidence FOR SELECT
USING (organization_id = get_user_org_id(auth.uid()));

-- COMPANY EVENTS
DROP POLICY IF EXISTS "Admins can manage company events" ON public.company_events;
DROP POLICY IF EXISTS "Authenticated users can view company events" ON public.company_events;

CREATE POLICY "Admins can manage company events"
ON public.company_events FOR ALL
USING (is_admin(auth.uid()) AND (organization_id IS NULL OR organization_id = get_user_org_id(auth.uid())))
WITH CHECK (is_admin(auth.uid()) AND (organization_id = get_user_org_id(auth.uid())));

CREATE POLICY "Org members can view their company events"
ON public.company_events FOR SELECT
USING (organization_id = get_user_org_id(auth.uid()));
