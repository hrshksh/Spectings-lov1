
-- Allow admins to update any profile (e.g. subscription plans)
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (is_admin(auth.uid()));
