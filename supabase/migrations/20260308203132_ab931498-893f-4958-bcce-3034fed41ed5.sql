
-- Fix: Allow org members to see ALL members of their org (not just own row)
DROP POLICY IF EXISTS "Members can view their org members" ON public.organization_members;
CREATE POLICY "Members can view their org members"
  ON public.organization_members
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM public.organization_members om WHERE om.user_id = auth.uid()
    )
    OR is_admin(auth.uid())
  );

-- Fix: Allow viewing profiles of users in the same organization
DROP POLICY IF EXISTS "Org members can view teammate profiles" ON public.profiles;
CREATE POLICY "Org members can view teammate profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT om2.user_id FROM public.organization_members om1
      JOIN public.organization_members om2 ON om1.organization_id = om2.organization_id
      WHERE om1.user_id = auth.uid()
    )
  );
