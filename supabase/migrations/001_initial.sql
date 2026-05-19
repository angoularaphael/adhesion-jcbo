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
-- Données initiales (seed)
-- ============================================================

INSERT INTO config VALUES ('admin_mot_de_passe', 'Jcbo2025!') ON CONFLICT (cle) DO NOTHING;

INSERT INTO adherents VALUES
  ('ADH-001','Marie','Dupont','m.dupont@dupont-associes.fr','Marie2025!','06 12 34 56 78','Dupont & Associés','Conseil juridique','Actif','2024-03-15','ADH-2024-0042','Standard','actif','2024-03-15','{COURS-001}'),
  ('ADH-002','Paul','Morin','p.morin@example.fr','Paul2025!','06 23 45 67 89','Morin Solutions','Technologie','Actif','2025-04-30','ADH-2025-0001',NULL,NULL,NULL,'{}'),
  ('ADH-003','Clara','Petit','c.petit@example.fr','Clara2025!','','Petit Design','Design & Communication','Actif','2025-04-22','ADH-2025-0002',NULL,NULL,NULL,'{}'),
  ('ADH-004','Marc','Leblanc','m.leblanc@example.fr','Marc2025!','','Leblanc & Co','Commerce','Inactif','2025-04-10','ADH-2025-0003',NULL,NULL,NULL,'{}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO actualites VALUES
  ('1','Lancement du programme d''accompagnement 2025','JCBO Conseil lance son nouveau programme d''accompagnement stratégique pour les entreprises en croissance.','Publié','2025-04-28'),
  ('2','Atelier fiscal — Juin 2025','Inscriptions ouvertes pour l''atelier sur les optimisations fiscales pour les TPE/PME.','Publié','2025-04-15'),
  ('3','Partenariat avec CCI Paris Île-de-France','JCBO Conseil officialise un partenariat avec la CCI pour élargir son réseau d''adhérents.','Brouillon','2025-03-20')
ON CONFLICT (id) DO NOTHING;

INSERT INTO conversations VALUES
  ('MSG-001','m.dupont@dupont-associes.fr','Marie Dupont','Dupont & Associés','Question sur mon adhésion','Bonjour Marie, bien sûr ! Je vous envoie les modalités par e-mail.','2025-05-04',1,1),
  ('MSG-002','t.renard@renard-consulting.fr','Thomas Renard','Renard Consulting','Accès aux ressources','Nous avons résolu le problème, le fichier est à nouveau disponible.','2025-05-03',0,0),
  ('MSG-003','s.laurent@laurent-co.fr','Sophie Laurent','Laurent & Co','Demande de renseignements','Quels sont les avantages de l''adhésion premium ?','2025-05-02',1,0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO messages (id, conversation_id, de, texte, heure) VALUES
  ('M-001-1','MSG-001','adherent','Bonjour, je souhaite renouveler mon adhésion pour l''année prochaine.','09:14'),
  ('M-001-2','MSG-001','admin','Bonjour Marie, bien sûr ! Je vous envoie les modalités par e-mail.','09:32'),
  ('M-002-1','MSG-002','adherent','Je n''arrive pas à télécharger le guide de création d''entreprise.','14:02'),
  ('M-002-2','MSG-002','admin','Nous avons résolu le problème, le fichier est à nouveau disponible.','15:20'),
  ('M-003-1','MSG-003','adherent','Quels sont les avantages de l''adhésion premium ?','11:30')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ressources VALUES
  ('RES-001','Guide de création d''entreprise 2025','Guide','2025-01-15','#',NULL),
  ('RES-002','Modèle de statuts SAS','Modèle','2025-02-10','#',NULL),
  ('RES-003','Calculateur de charges sociales','Outil','2025-03-05','#',NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO cours VALUES
  ('COURS-001','MINDSET ENTREPRENEURIAL™','Programme complet d''accompagnement stratégique pour développer votre posture d''entrepreneur et structurer votre activité vers la haute performance.','14h','Intermédiaire','Publié',490,'2024-01-15'),
  ('COURS-002','Optimisation fiscale pour TPE/PME','Maîtrisez les leviers fiscaux et comptables pour optimiser la rentabilité de votre entreprise et sécuriser votre trésorerie.','6h','Débutant','Publié',290,'2025-03-01'),
  ('COURS-003','VENDEUR ATTITUDE™','Développez les réflexes, la posture et les techniques des meilleurs commerciaux. De la prospection à la conclusion, maîtrisez chaque étape du cycle de vente avec confiance et impact.','10h','Intermédiaire','Publié',390,'2025-01-10'),
  ('COURS-004','Leadership & Performance','Affirmez votre leadership, mobilisez vos équipes et pilotez la performance de votre organisation avec méthode, vision et discipline.','8h','Avancé','Publié',450,'2025-02-01'),
  ('COURS-005','Structuration stratégique','Posez les fondations solides de votre activité : business model, offre de valeur, positionnement et plan d''action structuré pour une croissance durable.','7h','Débutant','Publié',320,'2025-04-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO modules VALUES
  ('M01','COURS-001','Développement du mindset entrepreneurial','2h','Vidéo',1),
  ('M02','COURS-001','Renforcement de la posture professionnelle','2h','Vidéo',2),
  ('M03','COURS-001','Structuration stratégique de l''activité','2h','Document',3),
  ('M04','COURS-001','Prise de décision et pilotage','2h','Vidéo',4),
  ('M05','COURS-001','Leadership et discipline opérationnelle','2h','Vidéo',5),
  ('M06','COURS-001','Vision business et performance','2h','Document',6),
  ('M07','COURS-001','Communication d''impact et crédibilité professionnelle','2h','Quiz',7),
  ('M08','COURS-002','Introduction à la comptabilité d''entreprise','1h30','Vidéo',1),
  ('M09','COURS-002','Lire et interpréter un bilan','1h30','Document',2),
  ('M10','COURS-002','Stratégies d''optimisation fiscale','2h','Vidéo',3),
  ('M11','COURS-002','Évaluation finale','1h','Quiz',4),
  ('M12','COURS-003','La psychologie de l''acheteur','1h30','Vidéo',1),
  ('M13','COURS-003','Posture et communication commerciale','2h','Vidéo',2),
  ('M14','COURS-003','Techniques de prospection efficaces','2h','Document',3),
  ('M15','COURS-003','Traiter les objections','2h','Vidéo',4),
  ('M16','COURS-003','Conclure et fidéliser','1h30','Vidéo',5),
  ('M17','COURS-003','Évaluation VENDEUR ATTITUDE™','1h','Quiz',6),
  ('M18','COURS-004','Les fondements du leadership moderne','1h30','Vidéo',1),
  ('M19','COURS-004','Mobiliser et fédérer une équipe','2h','Vidéo',2),
  ('M20','COURS-004','Gestion de la performance et des KPIs','2h','Document',3),
  ('M21','COURS-004','Leadership en situation de crise','1h30','Vidéo',4),
  ('M22','COURS-004','Évaluation Leadership & Performance','1h','Quiz',5),
  ('M23','COURS-005','Clarifier sa vision et ses objectifs','1h30','Vidéo',1),
  ('M24','COURS-005','Construire son business model','2h','Document',2),
  ('M25','COURS-005','Définir son offre et son positionnement','2h','Vidéo',3),
  ('M26','COURS-005','Élaborer son plan d''action 90 jours','1h','Document',4),
  ('M27','COURS-005','Évaluation Structuration stratégique','30min','Quiz',5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO progressions VALUES
  ('m.dupont@dupont-associes.fr','COURS-001','{M01,M02,M03}','2024-09-15')
ON CONFLICT (adherent_email, cours_id) DO NOTHING;

INSERT INTO quiz_resultats VALUES
  ('m.dupont@dupont-associes.fr','COURS-001','M01',100,TRUE),
  ('m.dupont@dupont-associes.fr','COURS-001','M02',67,TRUE),
  ('m.dupont@dupont-associes.fr','COURS-001','M03',100,TRUE)
ON CONFLICT (adherent_email, cours_id, module_id) DO NOTHING;
