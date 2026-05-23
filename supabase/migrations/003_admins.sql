-- ============================================================
-- JCBO Conseil — Comptes administrateurs multiples
-- ============================================================

CREATE TABLE IF NOT EXISTS admins (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  mot_de_passe  TEXT NOT NULL,
  prenom        TEXT NOT NULL DEFAULT '',
  nom           TEXT NOT NULL DEFAULT '',
  telephone     TEXT NOT NULL DEFAULT '',
  photo_url     TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  statut        TEXT NOT NULL DEFAULT 'Actif' CHECK (statut IN ('Actif', 'Inactif')),
  cree_le       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cree_par      TEXT NOT NULL DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS admins_email_idx ON admins(email);
CREATE INDEX IF NOT EXISTS admins_role_idx ON admins(role);
