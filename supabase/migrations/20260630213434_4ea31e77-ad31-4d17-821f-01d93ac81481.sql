
-- 1. Add 'manager' role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';

-- 2. Add store column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store text;
UPDATE public.profiles SET store = '006' WHERE store IS NULL;
ALTER TABLE public.profiles ALTER COLUMN store SET NOT NULL;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_store_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_store_check CHECK (store IN ('006','003'));

-- 3. Helper to get a user's store (SECURITY DEFINER avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_store(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT store FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- 4. Update signup trigger to capture store + optional manager role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store text;
  v_role  text;
  v_pass  text;
BEGIN
  v_store := COALESCE(NEW.raw_user_meta_data->>'store', '006');
  IF v_store NOT IN ('006','003') THEN v_store := '006'; END IF;

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
$$;

-- 5. Replace product visibility policy: filter by store unless admin/manager
DROP POLICY IF EXISTS "Authenticated users can view all products" ON public.products;
CREATE POLICY "View products by store or staff"
ON public.products
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::text IN ('admin','manager')
  )
  OR public.get_user_store(products.user_id) = public.get_user_store(auth.uid())
);
