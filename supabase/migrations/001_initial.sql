-- ============================================================
-- JCBO Conseil — Schéma initial Supabase
-- ============================================================

-- Config (admin password, etc.)
CREATE TABLE IF NOT EXISTS config (
  cle   TEXT PRIMARY KEY,
  valeur TEXT NOT NULL
);

-- Adhérents
CREATE TABLE IF NOT EXISTS adherents (
  id                    TEXT PRIMARY KEY,
  prenom                TEXT NOT NULL,
  nom                   TEXT NOT NULL,
  email                 TEXT NOT NULL UNIQUE,
  mot_de_passe          TEXT NOT NULL,
  telephone             TEXT NOT NULL DEFAULT '',
  entreprise            TEXT NOT NULL DEFAULT '',
  secteur               TEXT NOT NULL DEFAULT '',
  statut                TEXT NOT NULL DEFAULT 'Actif',
  date_adhesion         DATE NOT NULL,
  numero_adherent       TEXT NOT NULL,
  abonnement_plan       TEXT,
  abonnement_statut     TEXT,
  abonnement_date_debut DATE,
  cours_inscrits        TEXT[] NOT NULL DEFAULT '{}'
);

-- Actualités
CREATE TABLE IF NOT EXISTS actualites (
  id      TEXT PRIMARY KEY,
  titre   TEXT NOT NULL,
  contenu TEXT NOT NULL DEFAULT '',
  statut  TEXT NOT NULL DEFAULT 'Brouillon',
  date    DATE NOT NULL
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL,
  adherent        TEXT NOT NULL,
  entreprise      TEXT NOT NULL DEFAULT '',
  sujet           TEXT NOT NULL,
  dernier_message TEXT NOT NULL DEFAULT '',
  date            DATE NOT NULL,
  non_lu          INT  NOT NULL DEFAULT 0,
  non_lu_adherent INT  NOT NULL DEFAULT 0
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  de              TEXT NOT NULL,
  texte           TEXT NOT NULL,
  heure           TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ressources
CREATE TABLE IF NOT EXISTS ressources (
  id         TEXT PRIMARY KEY,
  titre      TEXT NOT NULL,
  categorie  TEXT NOT NULL,
  date       DATE NOT NULL,
  fichier    TEXT NOT NULL DEFAULT '#',
  nom_fichier TEXT
);

-- Cours
CREATE TABLE IF NOT EXISTS cours (
  id          TEXT PRIMARY KEY,
  titre       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  duree       TEXT NOT NULL DEFAULT '',
  niveau      TEXT NOT NULL DEFAULT 'Débutant',
  statut      TEXT NOT NULL DEFAULT 'Brouillon',
  prix        NUMERIC,
  date        DATE NOT NULL
);

-- Modules de cours
CREATE TABLE IF NOT EXISTS modules (
  id       TEXT PRIMARY KEY,
  cours_id TEXT NOT NULL REFERENCES cours(id) ON DELETE CASCADE,
  titre    TEXT NOT NULL,
  duree    TEXT NOT NULL DEFAULT '',
  type     TEXT NOT NULL DEFAULT 'Vidéo',
  ordre    INT  NOT NULL DEFAULT 0
);

-- Progressions
CREATE TABLE IF NOT EXISTS progressions (
  adherent_email    TEXT NOT NULL,
  cours_id          TEXT NOT NULL,
  modules_termines  TEXT[] NOT NULL DEFAULT '{}',
  date_debut        DATE NOT NULL,
  PRIMARY KEY (adherent_email, cours_id)
);

-- Résultats de quiz
CREATE TABLE IF NOT EXISTS quiz_resultats (
  adherent_email TEXT NOT NULL,
  cours_id       TEXT NOT NULL,
  module_id      TEXT NOT NULL,
  score          INT  NOT NULL DEFAULT 0,
  passe          BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (adherent_email, cours_id, module_id)
);

-- Paiements
CREATE TABLE IF NOT EXISTS paiements (
  id                TEXT PRIMARY KEY,
  adherent_email    TEXT NOT NULL,
  cours_id          TEXT NOT NULL,
  cours_titre       TEXT NOT NULL,
  montant           NUMERIC NOT NULL,
  date              DATE NOT NULL,
  stripe_session_id TEXT NOT NULL UNIQUE,
  numer_transaction TEXT NOT NULL
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id             TEXT PRIMARY KEY,
  adherent_email TEXT NOT NULL,
  type           TEXT NOT NULL,
  titre          TEXT NOT NULL,
  message        TEXT NOT NULL,
  date           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lue            BOOLEAN NOT NULL DEFAULT FALSE
);

-- Certificats émis
CREATE TABLE IF NOT EXISTS certificats_emis (
  id             TEXT PRIMARY KEY,
  adherent_email TEXT NOT NULL,
  cours_id       TEXT NOT NULL,
  numero         TEXT NOT NULL UNIQUE,
  programme_code TEXT NOT NULL,
  niveau_code    TEXT NOT NULL,
  annee          INT  NOT NULL,
  date_emission  DATE NOT NULL,
  UNIQUE (adherent_email, cours_id)
);

-- Compteurs certificats (format "ME-L2-2025" → valeur séquentielle)
CREATE TABLE IF NOT EXISTS compteurs_certificats (
  cle    TEXT PRIMARY KEY,
  valeur INT  NOT NULL DEFAULT 0
);

-- ============================================================
-- Pas de données de démonstration ici (production).
-- — Super admin : ADMIN_EMAIL + ADMIN_PASSWORD (.env), créé au 1er login
-- — Adhérents / cours : dashboard ou scripts (npm run import:modules, seed:quiz)
-- — Profil admin : migration 002 (clés config) + table admins (migration 003)
-- ============================================================
