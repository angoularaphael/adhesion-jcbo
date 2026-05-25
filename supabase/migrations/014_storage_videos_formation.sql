-- Bucket privé pour les vidéos de formation (upload direct via signed URL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT
  'videos-formation',
  'videos-formation',
  false,
  524288000,
  ARRAY[
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-matroska'
  ]::text[]
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'videos-formation');

UPDATE storage.buckets
SET
  public = false,
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY[
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-matroska'
  ]::text[]
WHERE id = 'videos-formation';
