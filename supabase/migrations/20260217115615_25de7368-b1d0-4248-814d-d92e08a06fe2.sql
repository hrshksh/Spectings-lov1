
-- Add phone column to profiles
ALTER TABLE public.profiles ADD COLUMN phone text;

-- Add slug, size, country columns to organizations
ALTER TABLE public.organizations ADD COLUMN slug text UNIQUE;
ALTER TABLE public.organizations ADD COLUMN size text;
ALTER TABLE public.organizations ADD COLUMN country text;
