
-- Drop existing SELECT policies on company_events that conflict
DROP POLICY IF EXISTS "Org members can view their company events" ON public.company_events;
DROP POLICY IF EXISTS "Users can view events for tracked companies" ON public.company_events;

-- Single permissive policy: users can see events for companies their org tracks
CREATE POLICY "Users can view events for companies they track"
ON public.company_events
FOR SELECT
TO authenticated
USING (
  -- User's org owns this event
  organization_id = get_user_org_id(auth.uid())
  OR
  -- User's org tracks this company via company_trackers
  EXISTS (
    SELECT 1 FROM public.company_trackers ct
    WHERE ct.company_id = company_events.company_id
      AND ct.organization_id = get_user_org_id(auth.uid())
  )
);
