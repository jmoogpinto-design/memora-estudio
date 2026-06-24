
CREATE POLICY "Admins manage order images" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'order-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'order-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients read own order images" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'order-images'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.client_user_id = auth.uid()
        AND (storage.foldername(name))[1] = o.id::text
    )
  );

CREATE POLICY "Clients upload own order images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'order-images'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.client_user_id = auth.uid()
        AND (storage.foldername(name))[1] = o.id::text
    )
  );
