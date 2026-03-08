
-- Junction table: which orgs are tracking which companies
CREATE TABLE public.company_trackers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, organization_id)
);

ALTER TABLE public.company_trackers ENABLE ROW LEVEL SECURITY;

-- Admins can see all trackers
CREATE POLICY "Admins can manage company trackers"
ON public.company_trackers FOR ALL TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Org members can view their own tracking entries
CREATE POLICY "Org members can view their trackers"
ON public.company_trackers FOR SELECT TO authenticated
USING (organization_id = get_user_org_id(auth.uid()));

-- Org members can insert their own tracking entries
CREATE POLICY "Org members can add trackers"
ON public.company_trackers FOR INSERT TO authenticated
WITH CHECK (organization_id = get_user_org_id(auth.uid()));

-- Backfill existing companies into company_trackers
INSERT INTO public.company_trackers (company_id, organization_id)
SELECT id, organization_id FROM public.companies
WHERE organization_id IS NOT NULL
ON CONFLICT DO NOTHING;
