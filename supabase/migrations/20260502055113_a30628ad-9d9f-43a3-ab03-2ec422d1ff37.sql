ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS production_stage TEXT NOT NULL DEFAULT 'order_placed',
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS courier_partner TEXT,
  ADD COLUMN IF NOT EXISTS estimated_delivery DATE,
  ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Allow admins to update any order (for fulfillment)
DROP POLICY IF EXISTS "Admins can update any order" ON public.orders;
CREATE POLICY "Admins can update any order"
ON public.orders FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));