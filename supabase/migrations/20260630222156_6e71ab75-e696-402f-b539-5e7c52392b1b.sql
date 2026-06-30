
-- PROFILES: remove políticas amplas e cria política restrita
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Qualquer pessoa autenticada pode ver perfis" ON public.profiles;

CREATE POLICY "Profiles visible to self, same store or admin"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.get_user_store(user_id) = public.get_user_store(auth.uid())
);

-- USER_ROLES: remove visibilidade ampla
DROP POLICY IF EXISTS "Qualquer pessoa autenticada pode ver funções" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
