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
    abonnement: { plan: "Standard", statut: "actif" as const, dateDebut: "2024-03-15" },
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
    abonnement: null as null | { plan: string; statut: "actif" | "inactif"; dateDebut: string },
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
    abonnement: null as null | { plan: string; statut: "actif" | "inactif"; dateDebut: string },
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
    abonnement: null as null | { plan: string; statut: "actif" | "inactif"; dateDebut: string },
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
    quizResultats: [
      { moduleId: "M01", score: 100, passe: true },
      { moduleId: "M02", score: 67, passe: true },
      { moduleId: "M03", score: 100, passe: true },
    ] as { moduleId: string; score: number; passe: boolean }[],
    dateDebut: "2024-09-15",
  },
];

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correcte: number; // index de la bonne réponse
};

export const mockQuizParModule: Record<string, QuizQuestion[]> = {
  M01: [
    { id: "Q1", question: "Qu'est-ce que le mindset entrepreneurial ?", options: ["Une technique de vente", "Un état d'esprit orienté croissance et opportunité", "Un outil de gestion comptable", "Une méthode de marketing"], correcte: 1 },
    { id: "Q2", question: "Quelle attitude caractérise l'entrepreneur à fort potentiel ?", options: ["Attendre que les conditions soient parfaites", "Blâmer l'environnement en cas d'échec", "Apprendre de ses erreurs et pivoter", "Éviter les risques à tout prix"], correcte: 2 },
    { id: "Q3", question: "Le mindset de croissance (growth mindset) implique :", options: ["Croire que ses capacités sont figées", "Chercher constamment à apprendre et s'améliorer", "Se comparer négativement aux autres", "Refuser tout feedback"], correcte: 1 },
  ],
  M02: [
    { id: "Q1", question: "La posture professionnelle influence principalement :", options: ["Uniquement votre apparence physique", "La perception que les autres ont de votre crédibilité", "Votre vitesse de frappe au clavier", "Vos compétences techniques"], correcte: 1 },
    { id: "Q2", question: "Quel élément contribue le plus à une posture professionnelle solide ?", options: ["La chance", "La cohérence entre discours et actions", "Le réseau social uniquement", "Le diplôme obtenu"], correcte: 1 },
    { id: "Q3", question: "Renforcer sa posture professionnelle nécessite :", options: ["Ignorer les critiques", "Travailler sa communication et sa présentation", "Se limiter à son secteur d'expertise", "Éviter les situations nouvelles"], correcte: 1 },
  ],
  M03: [
    { id: "Q1", question: "La structuration stratégique d'une activité commence par :", options: ["Créer un logo", "Définir sa vision et ses objectifs clés", "Recruter immédiatement", "Investir dans la publicité"], correcte: 1 },
    { id: "Q2", question: "Un business model solide doit répondre à :", options: ["Comment je génère de la valeur et pour qui", "Combien coûte mon bureau", "Quel est mon salaire idéal", "Quels logiciels j'utilise"], correcte: 0 },
    { id: "Q3", question: "Quelle est la priorité dans la structuration d'une activité naissante ?", options: ["Les aspects esthétiques", "La validation du marché et de l'offre", "L'embauche d'une équipe", "La création d'une société holding"], correcte: 1 },
  ],
  M04: [
    { id: "Q1", question: "La prise de décision efficace repose sur :", options: ["L'intuition seule", "La collecte et l'analyse des données pertinentes", "L'avis de la majorité", "L'évitement du problème"], correcte: 1 },
    { id: "Q2", question: "Le pilotage d'activité implique de surveiller :", options: ["Uniquement le chiffre d'affaires", "Des indicateurs clés de performance (KPIs) multiples", "Seulement les dépenses", "L'opinion des concurrents"], correcte: 1 },
    { id: "Q3", question: "Face à une décision difficile, l'entrepreneur doit :", options: ["Déléguer systématiquement", "Fuir la responsabilité", "Analyser, décider et assumer", "Attendre que le problème se résolve seul"], correcte: 2 },
  ],
  M05: [
    { id: "Q1", question: "Le leadership entrepreneurial se traduit par :", options: ["Imposer ses décisions sans explication", "Inspirer et mobiliser les équipes vers un objectif commun", "Gérer uniquement les budgets", "Contrôler chaque tâche personnellement"], correcte: 1 },
    { id: "Q2", question: "La discipline opérationnelle consiste à :", options: ["Travailler 24h/24", "Appliquer rigoureusement les processus définis", "Tout faire soi-même", "Ignorer les plannings"], correcte: 1 },
    { id: "Q3", question: "Un leader efficace sait avant tout :", options: ["Tout décider seul", "Écouter, déléguer et faire confiance", "Éviter les conflits à tout prix", "Imposer son style de management"], correcte: 1 },
  ],
  M06: [
    { id: "Q1", question: "La vision business permet de :", options: ["Justifier les dépenses passées", "Donner une direction claire à long terme", "Éviter les investissements", "Limiter la croissance"], correcte: 1 },
    { id: "Q2", question: "La performance d'une entreprise se mesure :", options: ["Uniquement au nombre d'employés", "Par des indicateurs financiers et non-financiers", "Au prestige de ses bureaux", "Au nombre de réunions tenues"], correcte: 1 },
    { id: "Q3", question: "Pour maximiser la performance, l'entrepreneur doit :", options: ["Tout garder en tête sans systèmes", "Mettre en place des processus reproductibles", "Changer de stratégie chaque mois", "Ignorer les résultats passés"], correcte: 1 },
  ],
  M07: [
    { id: "Q1", question: "La communication d'impact vise à :", options: ["Parler le plus possible", "Transmettre un message clair qui génère une réaction", "Utiliser un vocabulaire technique complexe", "Impressionner par le volume d'information"], correcte: 1 },
    { id: "Q2", question: "La crédibilité professionnelle se construit :", options: ["En une seule réunion", "Sur la durée, par la cohérence et les résultats", "Grâce aux réseaux sociaux uniquement", "Par la taille de son entreprise"], correcte: 1 },
    { id: "Q3", question: "Lors d'une prise de parole professionnelle, il est important de :", options: ["Lire ses notes sans regarder l'audience", "Adapter son message à son interlocuteur", "Parler le plus vite possible", "Éviter les questions de l'audience"], correcte: 1 },
  ],
  M08: [
    { id: "Q1", question: "La comptabilité d'entreprise sert principalement à :", options: ["Décorer les rapports annuels", "Enregistrer et analyser les flux financiers", "Calculer les congés des employés", "Gérer les réseaux sociaux"], correcte: 1 },
    { id: "Q2", question: "Un compte de résultat présente :", options: ["Les biens possédés par l'entreprise", "Les produits et charges sur une période", "Le capital social uniquement", "La liste des clients"], correcte: 1 },
    { id: "Q3", question: "La trésorerie correspond à :", options: ["Le bénéfice annuel", "Les liquidités disponibles à un instant donné", "Le patrimoine total de l'entreprise", "Les dettes à long terme"], correcte: 1 },
  ],
  M09: [
    { id: "Q1", question: "Le bilan comptable montre :", options: ["Les flux de trésorerie du mois", "L'actif (ce que l'entreprise possède) et le passif (ce qu'elle doit)", "Uniquement les dettes", "Le chiffre d'affaires annuel"], correcte: 1 },
    { id: "Q2", question: "Les capitaux propres dans un bilan représentent :", options: ["Les dettes fournisseurs", "La valeur nette appartenant aux associés", "Les investissements futurs", "Les salaires à verser"], correcte: 1 },
    { id: "Q3", question: "Un bilan équilibré signifie que :", options: ["L'entreprise est rentable", "Le total actif est égal au total passif", "Il n'y a pas de dettes", "Le résultat est positif"], correcte: 1 },
  ],
  M10: [
    { id: "Q1", question: "L'optimisation fiscale légale consiste à :", options: ["Dissimuler des revenus", "Utiliser les dispositifs légaux pour réduire l'imposition", "Ne pas déclarer certains flux", "Délocaliser dans des paradis fiscaux"], correcte: 1 },
    { id: "Q2", question: "La TVA collectée par l'entreprise doit être :", options: ["Conservée comme bénéfice", "Reversée à l'État", "Distribuée aux associés", "Utilisée pour payer les salaires"], correcte: 1 },
    { id: "Q3", question: "Une charge déductible permet de :", options: ["Augmenter le résultat imposable", "Réduire l'assiette d'imposition", "Éviter toute déclaration fiscale", "Augmenter le chiffre d'affaires"], correcte: 1 },
  ],
  M11: [
    { id: "Q1", question: "L'optimisation de la trésorerie passe par :", options: ["Ignorer les délais de paiement", "Anticiper les flux entrants et sortants", "Dépenser le maximum en fin de mois", "Éviter tout investissement"], correcte: 1 },
    { id: "Q2", question: "Un expert-comptable peut aider l'entrepreneur à :", options: ["Choisir sa stratégie marketing", "Sécuriser sa conformité fiscale et sociale", "Recruter ses collaborateurs", "Créer son logo"], correcte: 1 },
    { id: "Q3", question: "Pour évaluer la santé financière d'une entreprise, on analyse :", options: ["Uniquement le chiffre d'affaires", "La rentabilité, la trésorerie et l'endettement", "Le nombre de salariés", "La notoriété de la marque"], correcte: 1 },
  ],
};

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

