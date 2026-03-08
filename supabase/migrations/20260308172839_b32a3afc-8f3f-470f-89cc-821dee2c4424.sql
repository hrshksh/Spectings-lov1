
-- Allow users to see company events for companies their org is tracking
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
