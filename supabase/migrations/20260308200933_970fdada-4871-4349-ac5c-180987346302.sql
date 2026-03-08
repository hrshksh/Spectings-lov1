CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _org_id uuid;
  _org_name text;
  _org_slug text;
  _org_industry text;
  _org_size text;
  _org_country text;
  _phone text;
  _existing_membership boolean;
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
  )
  ON CONFLICT (id) DO NOTHING;

  -- Check if user was already added to an org (e.g. via invite)
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members WHERE user_id = NEW.id
  ) INTO _existing_membership;

  IF _existing_membership THEN
    -- Invited user: assign customer_user role if they don't have one yet
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id) THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'customer_user');
    END IF;
  ELSIF _org_name IS NOT NULL AND _org_name <> '' THEN
    -- Self-registered user: create org + assign customer_admin
    INSERT INTO public.organizations (name, slug, industry, size, country)
    VALUES (_org_name, _org_slug, _org_industry, _org_size, _org_country)
    RETURNING id INTO _org_id;

    INSERT INTO public.organization_members (organization_id, user_id)
    VALUES (_org_id, NEW.id);

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer_admin');
  END IF;

  RETURN NEW;
END;
$function$;