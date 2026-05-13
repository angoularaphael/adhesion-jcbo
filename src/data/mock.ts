export const mockAdmin = {
  prenom: "Jean-Christophe",
  nom: "Boyang",
  email: "jc.boyang@jcbo-conseil.fr",
  motDePasse: "Jcbo2025!",
};

export const mockAdherents = [
  {
    id: "ADH-001",
    prenom: "Marie", nom: "Dupont",
    email: "m.dupont@dupont-associes.fr",
    motDePasse: "Marie2025!",
    telephone: "06 12 34 56 78",
    entreprise: "Dupont & Associés",
    secteur: "Conseil juridique",
    statut: "Actif" as const,
    dateAdhesion: "2024-03-15",
    numeroAdherent: "ADH-2024-0042",
    coursInscrits: ["COURS-001"] as string[],
  },
  {
    id: "ADH-002",
    prenom: "Paul", nom: "Morin",
    email: "p.morin@example.fr",
    motDePasse: "Paul2025!",
    telephone: "06 23 45 67 89",
    entreprise: "Morin Solutions",
    secteur: "Technologie",
    statut: "Actif" as const,
    dateAdhesion: "2025-04-30",
    numeroAdherent: "ADH-2025-0001",
    coursInscrits: [] as string[],
  },
  {
    id: "ADH-003",
    prenom: "Clara", nom: "Petit",
    email: "c.petit@example.fr",
    motDePasse: "Clara2025!",
    telephone: "",
    entreprise: "Petit Design",
    secteur: "Design & Communication",
    statut: "Actif" as const,
    dateAdhesion: "2025-04-22",
    numeroAdherent: "ADH-2025-0002",
    coursInscrits: [] as string[],
  },
  {
    id: "ADH-004",
    prenom: "Marc", nom: "Leblanc",
    email: "m.leblanc@example.fr",
    motDePasse: "Marc2025!",
    telephone: "",
    entreprise: "Leblanc & Co",
    secteur: "Commerce",
    statut: "Inactif" as const,
    dateAdhesion: "2025-04-10",
    numeroAdherent: "ADH-2025-0003",
    coursInscrits: [] as string[],
  },
];

export const mockStats = {
  totalAdherents: 47,
  adherentsActifs: 42,
  nouveauxCeMois: 5,
  tauxRenouvellement: 89,
};

export const mockActualites = [
  {
    id: "1",
    titre: "Lancement du programme d'accompagnement 2025",
    contenu: "JCBO Conseil lance son nouveau programme d'accompagnement stratégique pour les entreprises en croissance.",
    date: "2025-04-28",
    statut: "Publié",
  },
  {
    id: "2",
    titre: "Atelier fiscal — Juin 2025",
    contenu: "Inscriptions ouvertes pour l'atelier sur les optimisations fiscales pour les TPE/PME.",
    date: "2025-04-15",
    statut: "Publié",
  },
  {
    id: "3",
    titre: "Partenariat avec CCI Paris Île-de-France",
    contenu: "JCBO Conseil officialise un partenariat avec la CCI pour élargir son réseau d'adhérents.",
    date: "2025-03-20",
    statut: "Brouillon",
  },
];

export const mockConversations = [
  {
    id: "MSG-001",
    email: "m.dupont@dupont-associes.fr",
    adherent: "Marie Dupont",
    entreprise: "Dupont & Associés",
    sujet: "Question sur mon adhésion",
    dernier_message: "Bonjour, je souhaite renouveler mon adhésion pour l'année prochaine.",
    date: "2025-05-04",
    non_lu: 2,
    messages: [
      { de: "adherent", texte: "Bonjour, je souhaite renouveler mon adhésion pour l'année prochaine.", heure: "09:14" },
      { de: "admin", texte: "Bonjour Marie, bien sûr ! Je vous envoie les modalités par e-mail.", heure: "09:32" },
      { de: "adherent", texte: "Merci beaucoup. Et est-il possible de payer en plusieurs fois ?", heure: "09:45" },
    ],
  },
  {
    id: "MSG-002",
    email: "t.renard@renard-consulting.fr",
    adherent: "Thomas Renard",
    entreprise: "Renard Consulting",
    sujet: "Accès aux ressources",
    dernier_message: "Je n'arrive pas à télécharger le guide de création d'entreprise.",
    date: "2025-05-03",
    non_lu: 0,
    messages: [
      { de: "adherent", texte: "Je n'arrive pas à télécharger le guide de création d'entreprise.", heure: "14:02" },
      { de: "admin", texte: "Nous avons résolu le problème, le fichier est à nouveau disponible.", heure: "15:20" },
    ],
  },
  {
    id: "MSG-003",
    email: "s.laurent@laurent-co.fr",
    adherent: "Sophie Laurent",
    entreprise: "Laurent & Co",
    sujet: "Demande de renseignements",
    dernier_message: "Quels sont les avantages de l'adhésion premium ?",
    date: "2025-05-02",
    non_lu: 1,
    messages: [
      { de: "adherent", texte: "Quels sont les avantages de l'adhésion premium ?", heure: "11:30" },
    ],
  },
];

export const mockIdentifiants = [
  { id: "ID-001", nom: "Paul Morin", email: "p.morin@example.fr", cree_le: "2025-04-30", statut: "Actif" },
  { id: "ID-002", nom: "Clara Petit", email: "c.petit@example.fr", cree_le: "2025-04-22", statut: "Actif" },
  { id: "ID-003", nom: "Marc Leblanc", email: "m.leblanc@example.fr", cree_le: "2025-04-10", statut: "Inactif" },
];

export const mockAdherent = {
  prenom: "Marie",
  nom: "Dupont",
  email: "m.dupont@dupont-associes.fr",
  motDePasse: "Marie2025!",
  telephone: "06 12 34 56 78",
  entreprise: "Dupont & Associés",
  secteur: "Conseil juridique",
  numeroAdherent: "ADH-2024-0042",
  statut: "Actif",
  dateAdhesion: "2024-03-15",
};

export const mockAdhesion = {
  numero: "ADH-2024-0042",
  statut: "active",
  dateDebut: "2024-03-15",
  dateFin: "2025-03-15",
  programme: "MINDSET ENTREPRENEURIAL™",
  paiements: [
    { id: "PAY-001", date: "2024-03-15", montant: 490, methode: "Virement", reference: "VIR-2024-042" },
    { id: "PAY-002", date: "2024-09-15", montant: 490, methode: "Virement", reference: "VIR-2024-089" },
  ],
};

export const mockCertificat = {
  nom: "Marie Dupont",
  programme: "MINDSET ENTREPRENEURIAL™",
  numero: "JCBO-ME-240042",
  dateDelivrance: "2024-09-20",
  competences: [
    "Développement du mindset entrepreneurial",
    "Renforcement de la posture professionnelle",
    "Structuration stratégique de l'activité",
    "Prise de décision et pilotage",
    "Leadership et discipline opérationnelle",
    "Vision business et performance",
    "Communication d'impact et crédibilité professionnelle",
  ],
};

export const mockCours = [
  {
    id: "COURS-001",
    titre: "MINDSET ENTREPRENEURIAL™",
    description: "Programme complet d'accompagnement stratégique pour développer votre posture d'entrepreneur et structurer votre activité vers la haute performance.",
    duree: "14h",
    niveau: "Intermédiaire" as const,
    statut: "Publié" as const,
    date: "2024-01-15",
    modules: [
      { id: "M01", titre: "Développement du mindset entrepreneurial", duree: "2h", type: "Vidéo" as const, ordre: 1 },
      { id: "M02", titre: "Renforcement de la posture professionnelle", duree: "2h", type: "Vidéo" as const, ordre: 2 },
      { id: "M03", titre: "Structuration stratégique de l'activité", duree: "2h", type: "Document" as const, ordre: 3 },
      { id: "M04", titre: "Prise de décision et pilotage", duree: "2h", type: "Vidéo" as const, ordre: 4 },
      { id: "M05", titre: "Leadership et discipline opérationnelle", duree: "2h", type: "Vidéo" as const, ordre: 5 },
      { id: "M06", titre: "Vision business et performance", duree: "2h", type: "Document" as const, ordre: 6 },
      { id: "M07", titre: "Communication d'impact et crédibilité professionnelle", duree: "2h", type: "Quiz" as const, ordre: 7 },
    ],
  },
  {
    id: "COURS-002",
    titre: "Optimisation fiscale pour TPE/PME",
    description: "Maîtrisez les leviers fiscaux et comptables pour optimiser la rentabilité de votre entreprise et sécuriser votre trésorerie.",
    duree: "6h",
    niveau: "Débutant" as const,
    statut: "Brouillon" as const,
    date: "2025-03-01",
    modules: [
      { id: "M08", titre: "Introduction à la comptabilité d'entreprise", duree: "1h30", type: "Vidéo" as const, ordre: 1 },
      { id: "M09", titre: "Lire et interpréter un bilan", duree: "1h30", type: "Document" as const, ordre: 2 },
      { id: "M10", titre: "Stratégies d'optimisation fiscale", duree: "2h", type: "Vidéo" as const, ordre: 3 },
      { id: "M11", titre: "Évaluation finale", duree: "1h", type: "Quiz" as const, ordre: 4 },
    ],
  },
];

export const mockProgressions = [
  {
    adherentEmail: "m.dupont@dupont-associes.fr",
    coursId: "COURS-001",
    modulesTermines: ["M01", "M02", "M03"],
    dateDebut: "2024-09-15",
  },
];

export const mockRessources = [
  {
    id: "RES-001",
    titre: "Guide de création d'entreprise 2025",
    categorie: "Guide",
    date: "2025-01-15",
    fichier: "#",
  },
  {
    id: "RES-002",
    titre: "Modèle de statuts SAS",
    categorie: "Modèle",
    date: "2025-02-10",
    fichier: "#",
  },
  {
    id: "RES-003",
    titre: "Calculateur de charges sociales",
    categorie: "Outil",
    date: "2025-03-05",
    fichier: "#",
  },
];

