
-- Fix 1: Organizations RLS policy bug (wrong column reference)
DROP POLICY "Members can view their organizations" ON public.organizations;

CREATE POLICY "Members can view their organizations" 
  ON public.organizations FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
    )
    OR public.is_admin(auth.uid())
  );

-- Fix 2: Companies - remove broad authenticated access, keep admin-only
DROP POLICY "Authenticated users can view companies" ON public.companies;

CREATE POLICY "Admins can view companies"
  ON public.companies FOR SELECT USING (
    public.is_admin(auth.uid())
  );

-- Fix 3: People - remove broad authenticated access, keep admin-only
DROP POLICY "Authenticated users can view people" ON public.people;

CREATE POLICY "Admins can view people"
  ON public.people FOR SELECT USING (
    public.is_admin(auth.uid())
  );
