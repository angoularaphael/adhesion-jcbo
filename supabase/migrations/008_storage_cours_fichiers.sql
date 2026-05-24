-- Bucket privé pour les PDF / documents de cours (servis via /api/cours/fichier)
-- Exécuter ce script en entier dans le SQL Editor Supabase.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT
  'cours-fichiers',
  'cours-fichiers',
  false,
  26214400,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip'
  ]::text[]
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'cours-fichiers'
);

UPDATE storage.buckets
SET
  public = false,
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip'
  ]::text[]
WHERE id = 'cours-fichiers';
