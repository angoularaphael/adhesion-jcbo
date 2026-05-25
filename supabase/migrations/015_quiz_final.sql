-- Quiz final par cours (certificat : 100 % modules + quiz final ≥ 80 %)
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS cours_id TEXT REFERENCES cours(id) ON DELETE CASCADE;

ALTER TABLE quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_module_id_fkey;
ALTER TABLE quiz_questions ALTER COLUMN module_id DROP NOT NULL;
ALTER TABLE quiz_questions ADD CONSTRAINT quiz_questions_module_id_fkey
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_quiz_questions_cours_final
  ON quiz_questions (cours_id) WHERE module_id IS NULL;
