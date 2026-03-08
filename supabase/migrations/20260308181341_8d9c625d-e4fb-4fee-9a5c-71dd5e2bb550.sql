
-- ============ PEOPLE ============
DROP POLICY IF EXISTS "Org members can view their people" ON public.people;
CREATE POLICY "Org members can view their people"
ON public.people FOR SELECT TO authenticated
USING (
  organization_id = get_user_org_id(auth.uid())
  AND people.created_at >= (SELECT p.created_at FROM public.profiles p WHERE p.id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view people matching their tags" ON public.people;
CREATE POLICY "Users can view people matching their tags"
ON public.people FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_tags ut
    WHERE ut.user_id = auth.uid() AND ut.tag = ANY(people.tags)
  )
  AND people.created_at >= (SELECT p.created_at FROM public.profiles p WHERE p.id = auth.uid())
);

-- ============ LEADS ============
DROP POLICY IF EXISTS "Org members can view their leads" ON public.leads;
CREATE POLICY "Org members can view their leads"
ON public.leads FOR SELECT TO authenticated
USING (
  organization_id = get_user_org_id(auth.uid())
  AND leads.created_at >= (SELECT p.created_at FROM public.profiles p WHERE p.id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view leads matching their tags" ON public.leads;
CREATE POLICY "Users can view leads matching their tags"
ON public.leads FOR SELECT TO authenticated
USING (
  person_id IS NOT NULL
  AND user_has_matching_lead_tag(auth.uid(), person_id)
  AND leads.created_at >= (SELECT p.created_at FROM public.profiles p WHERE p.id = auth.uid())
);

-- ============ TRENDS (Perspects) ============
DROP POLICY IF EXISTS "Org members can view their trends" ON public.trends;
CREATE POLICY "Org members can view their trends"
ON public.trends FOR SELECT TO authenticated
USING (
  organization_id = get_user_org_id(auth.uid())
  AND trends.created_at >= (SELECT p.created_at FROM public.profiles p WHERE p.id = auth.uid())
);
