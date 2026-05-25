-- Compétences développées par cours
ALTER TABLE cours ADD COLUMN IF NOT EXISTS competences TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE cours ADD COLUMN IF NOT EXISTS certificat_intro TEXT;
ALTER TABLE cours ADD COLUMN IF NOT EXISTS certificat_code TEXT;
