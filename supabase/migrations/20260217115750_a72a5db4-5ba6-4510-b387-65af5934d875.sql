
-- Update handle_new_user to also store phone and create organization + membership
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  _org_id uuid;
  _org_name text;
  _org_slug text;
  _org_industry text;
  _org_size text;
  _org_country text;
  _phone text;
BEGIN
  _phone := NEW.raw_user_meta_data ->> 'phone';
  _org_name := NEW.raw_user_meta_data ->> 'org_name';
  _org_slug := NEW.raw_user_meta_data ->> 'org_slug';
  _org_industry := NEW.raw_user_meta_data ->> 'org_industry';
  _org_size := NEW.raw_user_meta_data ->> 'org_size';
  _org_country := NEW.raw_user_meta_data ->> 'org_country';

  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    _phone
  );

  -- Create organization if org_name is provided
  IF _org_name IS NOT NULL AND _org_name <> '' THEN
    INSERT INTO public.organizations (name, slug, industry, size, country)
    VALUES (_org_name, _org_slug, _org_industry, _org_size, _org_country)
    RETURNING id INTO _org_id;

    -- Add user as org member
    INSERT INTO public.organization_members (organization_id, user_id)
    VALUES (_org_id, NEW.id);

    -- Assign customer_admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer_admin');
  END IF;

  RETURN NEW;
END;
$$;
