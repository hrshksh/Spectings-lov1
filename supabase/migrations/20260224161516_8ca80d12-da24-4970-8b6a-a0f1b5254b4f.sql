
-- Table to store user's selected prospect subsections
CREATE TABLE public.prospect_selections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  subsection text NOT NULL CHECK (subsection IN ('for_sales', 'for_hiring', 'for_growth')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, subsection)
);

-- Enable RLS
ALTER TABLE public.prospect_selections ENABLE ROW LEVEL SECURITY;

-- Users can view their own selections
CREATE POLICY "Users can view own prospect selections"
ON public.prospect_selections FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own selections
CREATE POLICY "Users can insert own prospect selections"
ON public.prospect_selections FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own selections
CREATE POLICY "Users can delete own prospect selections"
ON public.prospect_selections FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all
CREATE POLICY "Admins can manage prospect selections"
ON public.prospect_selections FOR ALL
USING (is_admin(auth.uid()));
