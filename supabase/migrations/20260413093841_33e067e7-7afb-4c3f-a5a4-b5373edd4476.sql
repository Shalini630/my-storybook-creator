
-- Table to track abandoned carts and reminder state
CREATE TABLE public.abandoned_carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  reminder_level INT NOT NULL DEFAULT 0,
  last_reminded_at TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(order_id)
);

ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own abandoned carts"
ON public.abandoned_carts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own abandoned carts"
ON public.abandoned_carts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all abandoned carts"
ON public.abandoned_carts FOR ALL
USING (true)
WITH CHECK (true);

CREATE TRIGGER update_abandoned_carts_updated_at
BEFORE UPDATE ON public.abandoned_carts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add email column to profiles if not exists for sending reminders
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
