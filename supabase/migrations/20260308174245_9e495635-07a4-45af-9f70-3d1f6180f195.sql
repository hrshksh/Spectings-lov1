
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view all company events" ON public.company_events;

-- Users can only see events for companies their org tracks
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
);
