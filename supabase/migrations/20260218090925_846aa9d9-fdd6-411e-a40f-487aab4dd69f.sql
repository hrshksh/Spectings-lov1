
-- Drop the overly permissive policy
DROP POLICY "Authenticated users can create organizations" ON public.organizations;

-- Replace with a policy that only allows users without an org to create one
CREATE POLICY "Users without org can create organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );
