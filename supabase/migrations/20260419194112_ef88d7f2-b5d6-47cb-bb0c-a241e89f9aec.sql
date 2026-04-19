-- Private bucket for user-uploaded subject photos used in personalized books
INSERT INTO storage.buckets (id, name, public)
VALUES ('subject-photos', 'subject-photos', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies on storage.objects scoped to bucket + per-user folder
CREATE POLICY "Users can upload their own subject photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'subject-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own subject photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'subject-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own subject photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'subject-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own subject photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'subject-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);