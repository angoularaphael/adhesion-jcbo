-- ============================================================
-- Suppression des données de démonstration (ancien seed 001)
-- À exécuter si la base a déjà été créée avec les INSERT mock.
-- ============================================================

DELETE FROM quiz_resultats
WHERE adherent_email IN (
  'm.dupont@dupont-associes.fr',
  'p.morin@example.fr',
  'c.petit@example.fr',
  'm.leblanc@example.fr'
);

DELETE FROM progressions
WHERE adherent_email IN (
  'm.dupont@dupont-associes.fr',
  'p.morin@example.fr',
  'c.petit@example.fr',
  'm.leblanc@example.fr'
);

DELETE FROM messages
WHERE conversation_id IN ('MSG-001', 'MSG-002', 'MSG-003');

DELETE FROM conversations
WHERE id IN ('MSG-001', 'MSG-002', 'MSG-003');

DELETE FROM adherents
WHERE id IN ('ADH-001', 'ADH-002', 'ADH-003', 'ADH-004');

DELETE FROM actualites
WHERE id IN ('1', '2', '3');

DELETE FROM ressources
WHERE id IN ('RES-001', 'RES-002', 'RES-003');

-- Modules supprimés en cascade si cours supprimés (FK ON DELETE CASCADE)
DELETE FROM cours
WHERE id IN ('COURS-001', 'COURS-002', 'COURS-003', 'COURS-004', 'COURS-005');

-- Mot de passe admin en clair de l'ancien seed (remplacé par bcrypt via .env au login)
DELETE FROM config
WHERE cle = 'admin_mot_de_passe'
  AND valeur = 'Jcbo2025!';
