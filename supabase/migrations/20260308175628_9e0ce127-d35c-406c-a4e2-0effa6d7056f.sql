-- Remove SELECT bypass for admin roles on company events
DROP POLICY IF EXISTS "Admins can manage company events" ON public.company_events;

-- Keep admin write access without granting broad read access
CREATE POLICY "Admins can insert company events"
ON public.company_events
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid())
  AND organization_id = get_user_org_id(auth.uid())
);

CREATE POLICY "Admins can update company events"
ON public.company_events
FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid())
  AND organization_id = get_user_org_id(auth.uid())
)
WITH CHECK (
  is_admin(auth.uid())
  AND organization_id = get_user_org_id(auth.uid())
);

CREATE POLICY "Admins can delete company events"
ON public.company_events
FOR DELETE
TO authenticated
USING (
  is_admin(auth.uid())
  AND organization_id = get_user_org_id(auth.uid())
);