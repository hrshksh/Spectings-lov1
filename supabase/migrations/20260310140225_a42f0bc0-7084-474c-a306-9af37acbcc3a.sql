
-- =============================================================
-- FIX #1: Cross-org data leak via tag matching
-- =============================================================

-- Update user_has_matching_lead_tag to also check org_id
CREATE OR REPLACE FUNCTION public.user_has_matching_lead_tag(_user_id uuid, _person_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_tags ut
    JOIN people p ON p.id = _person_id
    WHERE ut.user_id = _user_id
      AND ut.tag = ANY(p.tags)
      AND p.organization_id = get_user_org_id(_user_id)
  )
$$;

-- Drop and recreate people tag-matching policy with org filter
DROP POLICY IF EXISTS "Users can view people matching their tags" ON public.people;
CREATE POLICY "Users can view people matching their tags"
ON public.people FOR SELECT TO authenticated
USING (
  organization_id = get_user_org_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM user_tags ut
    WHERE ut.user_id = auth.uid() AND ut.tag = ANY(people.tags)
  )
  AND created_at >= (SELECT p.created_at FROM profiles p WHERE p.id = auth.uid())
);

-- Drop and recreate leads tag-matching policy with org filter
DROP POLICY IF EXISTS "Users can view leads matching their tags" ON public.leads;
CREATE POLICY "Users can view leads matching their tags"
ON public.leads FOR SELECT TO authenticated
USING (
  organization_id = get_user_org_id(auth.uid())
  AND person_id IS NOT NULL
  AND user_has_matching_lead_tag(auth.uid(), person_id)
  AND created_at >= (SELECT p.created_at FROM profiles p WHERE p.id = auth.uid())
);

-- =============================================================
-- FIX #2: teammate_profiles view - recreate with proper security
-- =============================================================
DROP VIEW IF EXISTS public.teammate_profiles;

-- Use a security definer function instead of a view
CREATE OR REPLACE FUNCTION public.get_teammate_profiles()
RETURNS TABLE(id uuid, full_name text, avatar_url text, email text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id, p.full_name, p.avatar_url, p.email, p.created_at
  FROM profiles p
  WHERE p.id IN (
    SELECT om.user_id FROM organization_members om
    WHERE om.organization_id = get_user_org_id(auth.uid())
  )
$$;

-- Recreate the view using the function so existing code still works
CREATE OR REPLACE VIEW public.teammate_profiles AS
SELECT * FROM public.get_teammate_profiles();

REVOKE ALL ON public.teammate_profiles FROM anon;
GRANT SELECT ON public.teammate_profiles TO authenticated;
