-- The teammate_profiles view uses security_invoker=on, which means
-- it inherits the caller's RLS context on the underlying profiles table.
-- But views themselves need RLS enabled too. Since this is a view (not a table),
-- we can't enable RLS on it directly. Instead, the security_invoker flag
-- ensures the profiles table RLS applies. The scanner flags it because
-- views don't have their own RLS policies, but security_invoker handles it.

-- However, to be extra safe, let's make sure the view cannot be queried
-- by anon users by granting access only to authenticated role.
REVOKE ALL ON public.teammate_profiles FROM anon;
GRANT SELECT ON public.teammate_profiles TO authenticated;