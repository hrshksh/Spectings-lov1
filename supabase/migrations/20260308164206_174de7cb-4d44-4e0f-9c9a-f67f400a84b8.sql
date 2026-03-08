
-- Allow org members to insert companies (with their org_id)
CREATE POLICY "Org members can add companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (organization_id = get_user_org_id(auth.uid()));

-- Drop existing admin policy and recreate to allow cross-org SELECT
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;

CREATE POLICY "Admins can manage companies"
ON public.companies
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));
