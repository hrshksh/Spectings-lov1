-- Add subscription plan enum
CREATE TYPE public.subscription_plan AS ENUM ('free', 'essential', 'growth', 'agency', 'enterprise');

-- Add subscription and access control columns to profiles
ALTER TABLE public.profiles
ADD COLUMN subscription_plan subscription_plan NOT NULL DEFAULT 'free',
ADD COLUMN is_active boolean NOT NULL DEFAULT true,
ADD COLUMN subscription_ends_at timestamp with time zone;

-- Create index for faster queries
CREATE INDEX idx_profiles_subscription_plan ON public.profiles(subscription_plan);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);