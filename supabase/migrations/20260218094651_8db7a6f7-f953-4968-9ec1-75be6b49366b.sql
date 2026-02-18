
-- Ad banners table
CREATE TABLE public.ad_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  image_url text,
  link_url text,
  is_active boolean NOT NULL DEFAULT false,
  position text NOT NULL DEFAULT 'sidebar',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_banners ENABLE ROW LEVEL SECURITY;

-- Only admins can manage ad banners
CREATE POLICY "Admins can manage ad banners"
  ON public.ad_banners FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- All authenticated users can view active banners
CREATE POLICY "Users can view active ad banners"
  ON public.ad_banners FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER update_ad_banners_updated_at
  BEFORE UPDATE ON public.ad_banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for ad images
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-banners', 'ad-banners', true);

-- Storage policies
CREATE POLICY "Anyone can view ad banner images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ad-banners');

CREATE POLICY "Admins can upload ad banner images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'ad-banners' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update ad banner images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'ad-banners' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete ad banner images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'ad-banners' AND is_admin(auth.uid()));
