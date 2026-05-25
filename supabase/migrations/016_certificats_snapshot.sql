-- Conserver les infos du certificat même si le cours est supprimé
ALTER TABLE certificats_emis ADD COLUMN IF NOT EXISTS cours_titre TEXT NOT NULL DEFAULT '';
ALTER TABLE certificats_emis ADD COLUMN IF NOT EXISTS cours_niveau TEXT NOT NULL DEFAULT '';
ALTER TABLE certificats_emis ADD COLUMN IF NOT EXISTS competences TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE certificats_emis ADD COLUMN IF NOT EXISTS certificat_intro TEXT NOT NULL DEFAULT '';
ALTER TABLE certificats_emis ADD COLUMN IF NOT EXISTS certificat_code TEXT NOT NULL DEFAULT '';
ALTER TABLE certificats_emis ADD COLUMN IF NOT EXISTS quiz_score INT;
