
-- Replace the tracker-based policy with a simple authenticated access policy
-- Since companies are already visible to all authenticated users, their events should be too
DROP POLICY IF EXISTS "Users can view events for companies they track" ON public.company_events;

CREATE POLICY "Authenticated users can view all company events"
ON public.company_events
FOR SELECT
TO authenticated
USING (true);
