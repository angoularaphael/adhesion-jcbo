-- Table pour tracker les téléchargements de ressources depuis la vitrine
CREATE TABLE IF NOT EXISTS telechargements_ressources (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  profession TEXT NOT NULL,
  resource TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telechargements_date ON telechargements_ressources(date DESC);
CREATE INDEX IF NOT EXISTS idx_telechargements_email ON telechargements_ressources(email);
