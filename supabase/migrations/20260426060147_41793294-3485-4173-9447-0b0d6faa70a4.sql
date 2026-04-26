-- Track the single active session per user
CREATE TABLE public.active_sessions (
  user_id UUID NOT NULL PRIMARY KEY,
  session_token TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own active session"
ON public.active_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own active session"
ON public.active_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own active session"
ON public.active_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own active session"
ON public.active_sessions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Realtime so other devices instantly detect a new login
ALTER TABLE public.active_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.active_sessions;

CREATE TRIGGER update_active_sessions_updated_at
BEFORE UPDATE ON public.active_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();