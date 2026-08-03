
-- Bucket público: galeria de inspirações (clientes escolhem durante o pedido)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket público: mosaico de portfólio (exibido no dashboard do cliente)
INSERT INTO storage.buckets (id, name, public)
VALUES ('mosaic', 'mosaic', true)
ON CONFLICT (id) DO NOTHING;

-- Qualquer pessoa pode ler (buckets são públicos, mas a policy protege no nível de objeto)
CREATE POLICY "Public read gallery" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Public read mosaic" ON storage.objects
  FOR SELECT USING (bucket_id = 'mosaic');

-- Somente admins podem fazer upload, update e delete
CREATE POLICY "Admins manage gallery" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage mosaic" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'mosaic' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'mosaic' AND public.has_role(auth.uid(), 'admin'));
