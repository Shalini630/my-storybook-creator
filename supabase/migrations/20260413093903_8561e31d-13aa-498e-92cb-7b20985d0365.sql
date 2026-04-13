
DROP POLICY "Service role can manage all abandoned carts" ON public.abandoned_carts;

CREATE POLICY "Users can update their own abandoned carts"
ON public.abandoned_carts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own abandoned carts"
ON public.abandoned_carts FOR DELETE
USING (auth.uid() = user_id);
