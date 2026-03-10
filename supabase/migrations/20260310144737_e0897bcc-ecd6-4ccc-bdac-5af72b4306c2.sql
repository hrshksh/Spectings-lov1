-- Make lead tag matching independent of organization
CREATE OR REPLACE FUNCTION public.user_has_matching_lead_tag(_user_id uuid, _person_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_tags ut
    JOIN public.people p ON p.id = _person_id
    WHERE ut.user_id = _user_id
      AND ut.tag = ANY(COALESCE(p.tags, ARRAY[]::text[]))
  )
$function$;

-- Allow people visibility by matching tags (cross-organization)
DROP POLICY IF EXISTS "Users can view people matching their tags" ON public.people;
CREATE POLICY "Users can view people matching their tags"
ON public.people
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_tags ut
    WHERE ut.user_id = auth.uid()
      AND ut.tag = ANY(COALESCE(people.tags, ARRAY[]::text[]))
  )
);

-- Allow leads visibility by matching tags (cross-organization)
DROP POLICY IF EXISTS "Users can view leads matching their tags" ON public.leads;
CREATE POLICY "Users can view leads matching their tags"
ON public.leads
FOR SELECT
TO authenticated
USING (
  person_id IS NOT NULL
  AND public.user_has_matching_lead_tag(auth.uid(), person_id)
);