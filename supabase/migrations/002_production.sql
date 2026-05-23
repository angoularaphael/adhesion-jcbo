-- ============================================================
-- JCBO Conseil — Migration production 002
-- ============================================================

-- Actualités enrichies
ALTER TABLE actualites ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE actualites ADD COLUMN IF NOT EXISTS categorie TEXT NOT NULL DEFAULT 'Actualité';
ALTER TABLE actualites ADD COLUMN IF NOT EXISTS extrait TEXT NOT NULL DEFAULT '';
ALTER TABLE actualites ADD COLUMN IF NOT EXISTS slug TEXT;

UPDATE actualites SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(titre, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS actualites_slug_idx ON actualites(slug) WHERE slug IS NOT NULL;

-- Admin profil (config clés supplémentaires)
INSERT INTO config (cle, valeur) VALUES
  ('admin_email', 'angoularaphael05@gmail.com'),
  ('admin_prenom', 'Angoula'),
  ('admin_nom', 'Raphael'),
  ('admin_telephone', ''),
  ('admin_photo_url', '')
ON CONFLICT (cle) DO NOTHING;

-- Modules enrichis
ALTER TABLE modules ADD COLUMN IF NOT EXISTS fichier_url TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS contenu_md TEXT;

-- Cours compétences (certificat UI)
ALTER TABLE cours ADD COLUMN IF NOT EXISTS competences TEXT[] NOT NULL DEFAULT '{}';

-- Paiements multi-provider
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'stripe';
ALTER TABLE paiements ALTER COLUMN stripe_session_id DROP NOT NULL;
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS fapshi_transaction_id TEXT;
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS external_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS paiements_fapshi_idx ON paiements(fapshi_transaction_id) WHERE fapshi_transaction_id IS NOT NULL;

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id          TEXT PRIMARY KEY,
  module_id   TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  options     JSONB NOT NULL DEFAULT '[]',
  correcte    INT  NOT NULL DEFAULT 0,
  ordre       INT  NOT NULL DEFAULT 0
);

-- Accès diagnostic (usage unique)
CREATE TABLE IF NOT EXISTS diagnostic_acces (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL,
  mot_de_passe    TEXT NOT NULL,
  nom             TEXT NOT NULL DEFAULT '',
  utilise         BOOLEAN NOT NULL DEFAULT FALSE,
  expire_le       TIMESTAMPTZ NOT NULL,
  cree_le         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cree_par        TEXT NOT NULL DEFAULT 'admin'
);

CREATE INDEX IF NOT EXISTS diagnostic_acces_email_idx ON diagnostic_acces(email);

-- Soumissions diagnostic
CREATE TABLE IF NOT EXISTS diagnostic_soumissions (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL,
  nom             TEXT NOT NULL DEFAULT '',
  donnees         JSONB NOT NULL DEFAULT '{}',
  lu              BOOLEAN NOT NULL DEFAULT FALSE,
  soumis_le       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Newsletter
CREATE TABLE IF NOT EXISTS newsletter_abonnes (
  email       TEXT PRIMARY KEY,
  inscrit_le  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications admin (email générique pour dashboard admin)
-- notifications existante : ajouter type diagnostic
-- Pas de changement schéma nécessaire (type TEXT libre)

-- Realtime : activer messages + conversations dans Supabase Dashboard → Database → Replication
