
-- Clients can now submit their own orders (client_user_id must match their own auth.uid())
CREATE POLICY "Clients create own orders" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (client_user_id = auth.uid());

-- Store rich form data captured by the client wizard (estilo, sujeitos, formato, etc.)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS form_data JSONB;
