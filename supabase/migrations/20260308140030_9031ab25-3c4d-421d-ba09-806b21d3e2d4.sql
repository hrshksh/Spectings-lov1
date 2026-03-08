
-- Create site_logos table for light/dark mode logos
CREATE TABLE public.site_logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  light_logo_url text,
  dark_logo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_logos ENABLE ROW LEVEL SECURITY;

-- Admins can manage logos
CREATE POLICY "Admins can manage site logos" ON public.site_logos
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- All authenticated users can view logos
CREATE POLICY "Users can view site logos" ON public.site_logos
  FOR SELECT TO authenticated
  USING (true);

-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('site-logos', 'site-logos', true);

-- Storage policies for site-logos bucket
CREATE POLICY "Admins can upload logos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-logos' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update logos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'site-logos' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete logos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'site-logos' AND is_admin(auth.uid()));

CREATE POLICY "Anyone can view logos" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'site-logos');
