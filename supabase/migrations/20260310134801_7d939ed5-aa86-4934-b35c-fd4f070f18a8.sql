-- 1. Remove the unsafe self-enrollment INSERT policy on organization_members
DROP POLICY IF EXISTS "Users can add themselves as org member" ON public.organization_members;

-- 2. Replace the broad teammate profile visibility policy with a restricted one
DROP POLICY IF EXISTS "Org members can view teammate profiles" ON public.profiles;

CREATE POLICY "Org members can view teammate profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT om.user_id FROM organization_members om
    WHERE om.organization_id = get_user_org_id(auth.uid())
  )
);

-- Create a safe view that hides sensitive fields for teammate queries
CREATE OR REPLACE VIEW public.teammate_profiles
WITH (security_invoker = on) AS
SELECT
  p.id,
  p.full_name,
  p.avatar_url,
  p.email,
  p.created_at
FROM public.profiles p
WHERE p.id IN (
  SELECT om.user_id FROM public.organization_members om
  WHERE om.organization_id = public.get_user_org_id(auth.uid())
);

-- 3. Fix companies SELECT policy to scope to user's org or admin
DROP POLICY IF EXISTS "Authenticated users can view tracked companies" ON public.companies;

CREATE POLICY "Users can view org or tracked companies"
ON public.companies
FOR SELECT
TO authenticated
USING (
  organization_id = get_user_org_id(auth.uid())
  OR is_admin(auth.uid())
);