
-- Fix people table: make user-facing SELECT policies PERMISSIVE
DROP POLICY IF EXISTS "Org members can view their people" ON public.people;
DROP POLICY IF EXISTS "Users can view people matching their tags" ON public.people;

CREATE POLICY "Org members can view their people"
  ON public.people FOR SELECT
  TO authenticated
  USING (
    (organization_id = get_user_org_id(auth.uid()))
    AND (created_at >= (SELECT p.created_at FROM profiles p WHERE p.id = auth.uid()))
  );

CREATE POLICY "Users can view people matching their tags"
  ON public.people FOR SELECT
  TO authenticated
  USING (
    (organization_id = get_user_org_id(auth.uid()))
    AND (EXISTS (
      SELECT 1 FROM user_tags ut
      WHERE ut.user_id = auth.uid() AND ut.tag = ANY(people.tags)
    ))
    AND (created_at >= (SELECT p.created_at FROM profiles p WHERE p.id = auth.uid()))
  );

-- Fix leads table: make user-facing SELECT policies PERMISSIVE
DROP POLICY IF EXISTS "Org members can view their leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view leads matching their tags" ON public.leads;

CREATE POLICY "Org members can view their leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (
    (organization_id = get_user_org_id(auth.uid()))
    AND (created_at >= (SELECT p.created_at FROM profiles p WHERE p.id = auth.uid()))
  );

CREATE POLICY "Users can view leads matching their tags"
  ON public.leads FOR SELECT
  TO authenticated
  USING (
    (organization_id = get_user_org_id(auth.uid()))
    AND (person_id IS NOT NULL)
    AND user_has_matching_lead_tag(auth.uid(), person_id)
    AND (created_at >= (SELECT p.created_at FROM profiles p WHERE p.id = auth.uid()))
  );
