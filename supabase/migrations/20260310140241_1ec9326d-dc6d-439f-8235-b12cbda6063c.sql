
-- Fix the security definer view linter warning by setting security_invoker
DROP VIEW IF EXISTS public.teammate_profiles;
CREATE OR REPLACE VIEW public.teammate_profiles
WITH (security_invoker = on) AS
SELECT * FROM public.get_teammate_profiles();

REVOKE ALL ON public.teammate_profiles FROM anon;
GRANT SELECT ON public.teammate_profiles TO authenticated;
