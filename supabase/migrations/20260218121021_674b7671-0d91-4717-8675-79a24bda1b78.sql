-- Create a security definer function to check if a user has matching tags for a lead
CREATE OR REPLACE FUNCTION public.user_has_matching_lead_tag(_user_id uuid, _person_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_tags ut
    JOIN people p ON p.id = _person_id
    WHERE ut.user_id = _user_id
      AND ut.tag = ANY(p.tags)
  )
$$;

-- Add policy: users can view leads where their tags match the person's tags
CREATE POLICY "Users can view leads matching their tags"
ON public.leads
FOR SELECT
USING (
  person_id IS NOT NULL AND user_has_matching_lead_tag(auth.uid(), person_id)
);

-- Also allow users to view people records linked to leads they can see via tags
CREATE POLICY "Users can view people matching their tags"
ON public.people
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM user_tags ut
    WHERE ut.user_id = auth.uid()
      AND ut.tag = ANY(people.tags)
  )
);