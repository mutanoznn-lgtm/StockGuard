
DROP POLICY IF EXISTS "View products by store or staff" ON public.products;
CREATE POLICY "View products by store"
ON public.products
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::text = 'admin'
  )
  OR public.get_user_store(products.user_id) = public.get_user_store(auth.uid())
);
