-- Suppression des comptes de test
-- Exécuter dans Supabase SQL Editor

BEGIN;

-- Données liées aux adhérents (e-mails en minuscules)
DELETE FROM messages
WHERE conversation_id IN (
  SELECT id FROM conversations
  WHERE email IN ('linuxcam05@gmail.com', 'farenogif05@gmail.com')
);

DELETE FROM conversations
WHERE email IN ('linuxcam05@gmail.com', 'farenogif05@gmail.com');

DELETE FROM notifications
WHERE adherent_email IN ('linuxcam05@gmail.com', 'farenogif05@gmail.com');

DELETE FROM progressions
WHERE adherent_email IN ('linuxcam05@gmail.com', 'farenogif05@gmail.com');

DELETE FROM quiz_resultats
WHERE adherent_email IN ('linuxcam05@gmail.com', 'farenogif05@gmail.com');

DELETE FROM certificats_emis
WHERE adherent_email IN ('linuxcam05@gmail.com', 'farenogif05@gmail.com');

DELETE FROM paiements
WHERE adherent_email IN ('linuxcam05@gmail.com', 'farenogif05@gmail.com');

-- Accès diagnostic éventuels
DELETE FROM diagnostic_acces
WHERE email IN ('linuxcam05@gmail.com', 'farenogif05@gmail.com');

-- Comptes adhérents
DELETE FROM adherents
WHERE email IN ('linuxcam05@gmail.com', 'farenogif05@gmail.com');

COMMIT;
