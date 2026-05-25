-- Bucket pour les PDF ressources vitrine (envoi par e-mail)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT
  'ressources-vitrine',
  'ressources-vitrine',
  false,
  26214400,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'ressources-vitrine');
