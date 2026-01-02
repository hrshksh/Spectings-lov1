-- Create user_tags table to store tags assigned to each user by admin
CREATE TABLE public.user_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tag)
);

-- Enable RLS
ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;

-- Users can view their own tags
CREATE POLICY "Users can view their own tags"
ON public.user_tags
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all tags
CREATE POLICY "Admins can manage user tags"
ON public.user_tags
FOR ALL
USING (is_admin(auth.uid()));

-- Create index for faster lookups
CREATE INDEX idx_user_tags_user_id ON public.user_tags(user_id);
CREATE INDEX idx_user_tags_tag ON public.user_tags(tag);