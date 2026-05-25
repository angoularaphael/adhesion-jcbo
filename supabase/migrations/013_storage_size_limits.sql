-- Augmente les limites de taille des buckets pour PDF / vidéos.
-- Vercel limite à ~4,5 Mo le body des fonctions ; on contourne via signed URL Supabase
-- qui accepte directement les uploads jusqu'à la limite du bucket.

UPDATE storage.buckets
SET file_size_limit = 52428800  -- 50 Mo
WHERE id = 'cours-fichiers';

UPDATE storage.buckets
SET file_size_limit = 52428800  -- 50 Mo
WHERE id = 'ressources-vitrine';

UPDATE storage.buckets
SET file_size_limit = 524288000  -- 500 Mo
WHERE id = 'videos-formation';
