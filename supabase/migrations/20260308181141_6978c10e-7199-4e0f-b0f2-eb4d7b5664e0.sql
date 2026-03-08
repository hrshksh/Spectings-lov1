
-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view events for tracked companies" ON public.company_events;

-- Recreate with signup date filter: users only see events created after their signup
CREATE POLICY "Users can view events for tracked companies"
ON public.company_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.company_trackers ct
    WHERE ct.company_id = company_events.company_id
      AND ct.organization_id = get_user_org_id(auth.uid())
  )
  AND company_events.created_at >= (
    SELECT p.created_at FROM public.profiles p WHERE p.id = auth.uid()
  )
);
