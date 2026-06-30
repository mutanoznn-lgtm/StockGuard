
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_store_check;

UPDATE public.profiles SET store = '005' WHERE store = '003';

ALTER TABLE public.profiles ADD CONSTRAINT profiles_store_check CHECK (store IN ('006','005'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_store text;
  v_role  text;
  v_pass  text;
BEGIN
  v_store := COALESCE(NEW.raw_user_meta_data->>'store', '006');
  IF v_store NOT IN ('006','005') THEN v_store := '006'; END IF;

  INSERT INTO public.profiles (user_id, username, store)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Usuário'),
    v_store
  );

  v_role := NEW.raw_user_meta_data->>'requested_role';
  v_pass := NEW.raw_user_meta_data->>'manager_passcode';

  IF v_role = 'manager' AND v_pass = '235689' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'manager');
  END IF;

  RETURN NEW;
END;
$function$;
