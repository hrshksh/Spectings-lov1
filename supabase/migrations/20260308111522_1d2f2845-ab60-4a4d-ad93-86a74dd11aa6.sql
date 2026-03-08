
-- Table for admin-controlled section access per user
CREATE TABLE public.user_section_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, section)
);

-- RLS
ALTER TABLE public.user_section_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own section access"
  ON public.user_section_access FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage section access"
  ON public.user_section_access FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
