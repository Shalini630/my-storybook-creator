
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  audience TEXT NOT NULL CHECK (audience IN ('kid', 'adult')),
  name TEXT NOT NULL,
  theme TEXT NOT NULL,
  tone TEXT,
  book_size TEXT,
  cover_type TEXT NOT NULL CHECK (cover_type IN ('softcover', 'hardcover')),
  dedication TEXT,
  personal_message TEXT,
  age TEXT,
  gender TEXT,
  interests TEXT,
  favorite_character TEXT,
  relationship TEXT,
  hobbies TEXT,
  favorite_memory TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'preview', 'completed', 'failed')),
  story_content JSONB,
  illustrations JSONB,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
ON public.orders FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
