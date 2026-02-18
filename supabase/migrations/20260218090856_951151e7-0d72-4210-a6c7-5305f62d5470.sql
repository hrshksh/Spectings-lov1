
-- Allow authenticated users to create an organization (for users without one)
CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to add themselves as org member
CREATE POLICY "Users can add themselves as org member"
  ON public.organization_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
