-- Nom du super administrateur + retrait de l'affichage côté liste gérée par l'app (role = admin uniquement)

UPDATE config SET valeur = 'Angoula' WHERE cle = 'admin_prenom';
UPDATE config SET valeur = 'Raphael' WHERE cle = 'admin_nom';

UPDATE admins
SET prenom = 'Angoula', nom = 'Raphael'
WHERE role = 'super_admin';
