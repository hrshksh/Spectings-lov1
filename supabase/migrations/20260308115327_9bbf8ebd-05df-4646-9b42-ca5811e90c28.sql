
-- Trends/Perspects table for admin-uploaded market trends
CREATE TABLE public.trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  trend_date date NOT NULL DEFAULT CURRENT_DATE,
  trend text NOT NULL,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage trends" ON public.trends
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()) AND (organization_id IS NULL OR organization_id = get_user_org_id(auth.uid())))
  WITH CHECK (is_admin(auth.uid()) AND organization_id = get_user_org_id(auth.uid()));

CREATE POLICY "Org members can view their trends" ON public.trends
  FOR SELECT TO authenticated
  USING (organization_id = get_user_org_id(auth.uid()));

-- Saved items table for Lists feature
CREATE TABLE public.saved_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('prospect', 'inspect', 'perspect')),
  record_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, source_type, record_id)
);

ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved items" ON public.saved_items
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
