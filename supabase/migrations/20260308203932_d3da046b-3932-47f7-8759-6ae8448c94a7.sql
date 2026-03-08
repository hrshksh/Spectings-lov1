
-- Fix infinite recursion: use SECURITY DEFINER function to check org membership
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND organization_id = _org_id
  )
$$;

-- Fix organization_members SELECT policy to avoid recursion
DROP POLICY IF EXISTS "Members can view their org members" ON public.organization_members;
CREATE POLICY "Members can view their org members"
  ON public.organization_members
  FOR SELECT
  TO authenticated
  USING (
    user_belongs_to_org(auth.uid(), organization_id)
    OR is_admin(auth.uid())
  );

-- Fix profiles policy that references organization_members (causing indirect recursion)
DROP POLICY IF EXISTS "Org members can view teammate profiles" ON public.profiles;
CREATE POLICY "Org members can view teammate profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT om.user_id FROM public.organization_members om
      WHERE om.organization_id = get_user_org_id(auth.uid())
    )
  );
