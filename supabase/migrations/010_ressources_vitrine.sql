-- Ressources affichables sur le site vitrine
ALTER TABLE ressources ADD COLUMN IF NOT EXISTS affiche_vitrine BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE ressources ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_ressources_vitrine ON ressources(affiche_vitrine) WHERE affiche_vitrine = true;
