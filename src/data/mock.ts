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
    dernier_message: "Bonjour Marie, bien sûr ! Je vous envoie les modalités par e-mail.",
    date: "2025-05-04",
    non_lu: 1,
    non_lu_adherent: 1,
    messages: [
      { de: "adherent", texte: "Bonjour, je souhaite renouveler mon adhésion pour l'année prochaine.", heure: "09:14" },
      { de: "admin", texte: "Bonjour Marie, bien sûr ! Je vous envoie les modalités par e-mail.", heure: "09:32" },
    ],
  },
  {
    id: "MSG-002",
    email: "t.renard@renard-consulting.fr",
    adherent: "Thomas Renard",
    entreprise: "Renard Consulting",
    sujet: "Accès aux ressources",
    dernier_message: "Nous avons résolu le problème, le fichier est à nouveau disponible.",
    date: "2025-05-03",
    non_lu: 0,
    non_lu_adherent: 0,
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
    non_lu_adherent: 0,
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
    prix: 490,
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
    statut: "Publié" as const,
    prix: 290,
    date: "2025-03-01",
    modules: [
      { id: "M08", titre: "Introduction à la comptabilité d'entreprise", duree: "1h30", type: "Vidéo" as const, ordre: 1 },
      { id: "M09", titre: "Lire et interpréter un bilan", duree: "1h30", type: "Document" as const, ordre: 2 },
      { id: "M10", titre: "Stratégies d'optimisation fiscale", duree: "2h", type: "Vidéo" as const, ordre: 3 },
      { id: "M11", titre: "Évaluation finale", duree: "1h", type: "Quiz" as const, ordre: 4 },
    ],
  },
  {
    id: "COURS-003",
    titre: "VENDEUR ATTITUDE™",
    description: "Développez les réflexes, la posture et les techniques des meilleurs commerciaux. De la prospection à la conclusion, maîtrisez chaque étape du cycle de vente avec confiance et impact.",
    duree: "10h",
    niveau: "Intermédiaire" as const,
    statut: "Publié" as const,
    prix: 390,
    date: "2025-01-10",
    modules: [
      { id: "M12", titre: "La psychologie de l'acheteur", duree: "1h30", type: "Vidéo" as const, ordre: 1 },
      { id: "M13", titre: "Posture et communication commerciale", duree: "2h", type: "Vidéo" as const, ordre: 2 },
      { id: "M14", titre: "Techniques de prospection efficaces", duree: "2h", type: "Document" as const, ordre: 3 },
      { id: "M15", titre: "Traiter les objections", duree: "2h", type: "Vidéo" as const, ordre: 4 },
      { id: "M16", titre: "Conclure et fidéliser", duree: "1h30", type: "Vidéo" as const, ordre: 5 },
      { id: "M17", titre: "Évaluation VENDEUR ATTITUDE™", duree: "1h", type: "Quiz" as const, ordre: 6 },
    ],
  },
  {
    id: "COURS-004",
    titre: "Leadership & Performance",
    description: "Affirmez votre leadership, mobilisez vos équipes et pilotez la performance de votre organisation avec méthode, vision et discipline.",
    duree: "8h",
    niveau: "Avancé" as const,
    statut: "Publié" as const,
    prix: 450,
    date: "2025-02-01",
    modules: [
      { id: "M18", titre: "Les fondements du leadership moderne", duree: "1h30", type: "Vidéo" as const, ordre: 1 },
      { id: "M19", titre: "Mobiliser et fédérer une équipe", duree: "2h", type: "Vidéo" as const, ordre: 2 },
      { id: "M20", titre: "Gestion de la performance et des KPIs", duree: "2h", type: "Document" as const, ordre: 3 },
      { id: "M21", titre: "Leadership en situation de crise", duree: "1h30", type: "Vidéo" as const, ordre: 4 },
      { id: "M22", titre: "Évaluation Leadership & Performance", duree: "1h", type: "Quiz" as const, ordre: 5 },
    ],
  },
  {
    id: "COURS-005",
    titre: "Structuration stratégique",
    description: "Posez les fondations solides de votre activité : business model, offre de valeur, positionnement et plan d'action structuré pour une croissance durable.",
    duree: "7h",
    niveau: "Débutant" as const,
    statut: "Publié" as const,
    prix: 320,
    date: "2025-04-01",
    modules: [
      { id: "M23", titre: "Clarifier sa vision et ses objectifs", duree: "1h30", type: "Vidéo" as const, ordre: 1 },
      { id: "M24", titre: "Construire son business model", duree: "2h", type: "Document" as const, ordre: 2 },
      { id: "M25", titre: "Définir son offre et son positionnement", duree: "2h", type: "Vidéo" as const, ordre: 3 },
      { id: "M26", titre: "Élaborer son plan d'action 90 jours", duree: "1h", type: "Document" as const, ordre: 4 },
      { id: "M27", titre: "Évaluation Structuration stratégique", duree: "30min", type: "Quiz" as const, ordre: 5 },
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
  // VENDEUR ATTITUDE™
  M12: [
    { id: "Q1", question: "La psychologie de l'acheteur repose principalement sur :", options: ["Le prix affiché", "Les émotions et la perception de valeur", "La notoriété de la marque uniquement", "Les caractéristiques techniques du produit"], correcte: 1 },
    { id: "Q2", question: "Comprendre les motivations d'achat permet de :", options: ["Réduire les prix", "Adapter son discours commercial à chaque profil", "Éviter de poser des questions", "Accélérer la présentation"], correcte: 1 },
    { id: "Q3", question: "Le frein d'achat le plus fréquent est :", options: ["Le manque de temps du vendeur", "La peur du changement et du risque perçu", "L'absence de catalogue", "Un site web insuffisant"], correcte: 1 },
  ],
  M13: [
    { id: "Q1", question: "Une posture commerciale solide se caractérise par :", options: ["Un discours agressif", "La confiance, l'écoute et la cohérence", "Une présentation très longue", "Des promesses non tenues"], correcte: 1 },
    { id: "Q2", question: "En communication commerciale, l'écoute active consiste à :", options: ["Attendre que le client finisse pour parler", "Reformuler, questionner et montrer que l'on comprend", "Parler plus fort que le client", "Ignorer les silences"], correcte: 1 },
    { id: "Q3", question: "Le langage non-verbal représente quel pourcentage de la communication ?", options: ["10 %", "30 %", "Plus de 55 %", "100 %"], correcte: 2 },
  ],
  M14: [
    { id: "Q1", question: "Une prospection efficace commence par :", options: ["Appeler le maximum de personnes sans ciblage", "Définir un profil client idéal (ICP)", "Envoyer des emails en masse", "Attendre les recommandations"], correcte: 1 },
    { id: "Q2", question: "Le meilleur canal de prospection dépend de :", options: ["Votre budget publicitaire uniquement", "Votre cible, votre offre et votre style", "La mode du moment", "Ce que font vos concurrents"], correcte: 1 },
    { id: "Q3", question: "Un pipeline de vente structuré permet de :", options: ["Vendre sans effort", "Suivre et piloter chaque opportunité commerciale", "Éviter les relances", "Réduire le nombre de prospects"], correcte: 1 },
  ],
  M15: [
    { id: "Q1", question: "Face à une objection 'C'est trop cher', la meilleure réponse est :", options: ["Baisser immédiatement le prix", "Comprendre ce que 'cher' signifie pour le client et revaloriser l'offre", "Ignorer l'objection", "Mettre fin à la négociation"], correcte: 1 },
    { id: "Q2", question: "Une objection est souvent le signe que :", options: ["Le client n'est pas intéressé", "Le client s'implique et cherche à être rassuré", "Le prix est trop élevé", "La présentation a échoué"], correcte: 1 },
    { id: "Q3", question: "La technique du 'oui... et' permet de :", options: ["Contredire le client", "Valider l'objection sans la laisser bloquer la vente", "Changer de sujet", "Proposer une remise"], correcte: 1 },
  ],
  M16: [
    { id: "Q1", question: "Le signal d'achat le plus fort chez un prospect est :", options: ["Il pose des questions sur la livraison ou les modalités", "Il demande une réduction", "Il reste silencieux", "Il compare avec un concurrent"], correcte: 0 },
    { id: "Q2", question: "La fidélisation client repose principalement sur :", options: ["Des remises permanentes", "La qualité de l'expérience après-vente", "Des campagnes publicitaires répétées", "Le nombre de produits proposés"], correcte: 1 },
    { id: "Q3", question: "Conclure une vente nécessite :", options: ["D'attendre que le client propose", "D'oser demander l'engagement au bon moment", "De baisser le prix en dernier recours", "D'envoyer une offre écrite uniquement"], correcte: 1 },
  ],
  M17: [
    { id: "Q1", question: "L'attitude du vendeur performant se définit par :", options: ["L'agressivité commerciale", "La persévérance, l'empathie et la préparation", "Le fait de parler sans écouter", "La chance"], correcte: 1 },
    { id: "Q2", question: "Un bon vendeur gère son temps en :", options: ["Se concentrant sur les prospects les plus faciles uniquement", "Priorisant les actions à fort impact commercial", "Improvisant chaque journée", "Évitant les relances"], correcte: 1 },
    { id: "Q3", question: "La vente consultative se distingue de la vente classique par :", options: ["Un prix plus élevé", "Une approche centrée sur les besoins du client plutôt que sur le produit", "L'absence de négociation", "Un cycle de vente plus court"], correcte: 1 },
  ],
  // Leadership & Performance
  M18: [
    { id: "Q1", question: "Le leadership moderne se distingue du management traditionnel par :", options: ["L'autorité hiérarchique", "L'inspiration, l'influence et la vision partagée", "Le contrôle permanent", "Les sanctions disciplinaires"], correcte: 1 },
    { id: "Q2", question: "Un leader efficace sait avant tout :", options: ["Tout décider seul", "Écouter, déléguer et développer ses collaborateurs", "Imposer son style de travail", "Éviter les conflits à tout prix"], correcte: 1 },
    { id: "Q3", question: "La légitimité d'un leader se construit grâce à :", options: ["Son titre officiel", "Ses résultats, sa cohérence et sa crédibilité", "Son ancienneté uniquement", "Ses relations personnelles"], correcte: 1 },
  ],
  M19: [
    { id: "Q1", question: "Pour fédérer une équipe autour d'un objectif, il faut :", options: ["Imposer l'objectif sans explication", "Donner du sens, impliquer et reconnaître les contributions", "Promettre des primes uniquement", "Éviter les réunions d'équipe"], correcte: 1 },
    { id: "Q2", question: "La délégation efficace implique :", options: ["Confier une tâche sans suivi", "Définir clairement les attentes, les ressources et les échéances", "Micromanager chaque étape", "Réserver les responsabilités aux managers seniors"], correcte: 1 },
    { id: "Q3", question: "La motivation d'une équipe dépend principalement de :", options: ["La rémunération seule", "La reconnaissance, l'autonomie et le sens du travail", "Le nombre de réunions", "La taille de l'entreprise"], correcte: 1 },
  ],
  M20: [
    { id: "Q1", question: "Un KPI pertinent doit être :", options: ["Difficile à mesurer pour rester ambitieux", "Spécifique, mesurable, atteignable, réaliste et temporel (SMART)", "Uniquement financier", "Défini une fois par an"], correcte: 1 },
    { id: "Q2", question: "Le pilotage de la performance nécessite :", options: ["D'ignorer les écarts si l'objectif global est atteint", "Un tableau de bord régulièrement mis à jour et analysé", "De changer les objectifs en cours de route", "De ne mesurer que les résultats financiers"], correcte: 1 },
    { id: "Q3", question: "Un collaborateur sous-performant doit être :", options: ["Sanctionné immédiatement", "Accompagné avec un plan de développement clair", "Ignoré pour ne pas démotiver l'équipe", "Remplacé sans dialogue"], correcte: 1 },
  ],
  M21: [
    { id: "Q1", question: "En situation de crise, le leader doit en priorité :", options: ["Blâmer les responsables publiquement", "Communiquer clairement, stabiliser l'équipe et décider vite", "Attendre que la situation se résolve seule", "Déléguer la totalité de la gestion de crise"], correcte: 1 },
    { id: "Q2", question: "La résilience d'un leader se manifeste par :", options: ["L'absence d'émotions", "La capacité à rebondir et à apprendre des épreuves", "L'évitement des situations difficiles", "La délégation systématique des problèmes"], correcte: 1 },
    { id: "Q3", question: "Après une crise, la priorité du leader est :", options: ["Retrouver la routine immédiatement", "Analyser, tirer les leçons et renforcer les processus", "Éviter d'en parler pour ne pas raviver les tensions", "Changer d'équipe"], correcte: 1 },
  ],
  M22: [
    { id: "Q1", question: "Un style de leadership adaptatif consiste à :", options: ["Appliquer toujours le même style de management", "Ajuster son approche selon la maturité et le contexte de l'équipe", "Laisser l'équipe s'organiser seule", "Imposer un cadre rigide en toute circonstance"], correcte: 1 },
    { id: "Q2", question: "La performance durable d'une organisation repose sur :", options: ["Des résultats à court terme uniquement", "L'alignement entre vision, culture, processus et personnes", "Une croissance du chiffre d'affaires uniquement", "Le recrutement permanent de nouveaux talents"], correcte: 1 },
    { id: "Q3", question: "Pour développer sa propre performance de leader, il faut :", options: ["Attendre les formations imposées par l'entreprise", "Pratiquer l'auto-évaluation, solliciter du feedback et se former continuellement", "Se comparer uniquement aux leaders célèbres", "Éviter les remises en question"], correcte: 1 },
  ],
  // Structuration stratégique
  M23: [
    { id: "Q1", question: "Une vision claire d'entreprise permet de :", options: ["Justifier les dépenses passées", "Donner une direction et aligner les décisions sur le long terme", "Limiter les ambitions", "Rassurer uniquement les investisseurs"], correcte: 1 },
    { id: "Q2", question: "Des objectifs SMART sont :", options: ["Généraux et inspirants", "Spécifiques, Mesurables, Atteignables, Réalistes et Temporels", "Uniquement quantitatifs", "Fixés une fois pour toutes"], correcte: 1 },
    { id: "Q3", question: "La première étape de la structuration d'une activité est :", options: ["Créer un logo", "Clarifier sa proposition de valeur et son marché cible", "Ouvrir un compte bancaire professionnel", "Recruter une équipe"], correcte: 1 },
  ],
  M24: [
    { id: "Q1", question: "Un business model décrit :", options: ["Uniquement le prix de vente", "Comment l'entreprise crée, délivre et capture de la valeur", "Le budget de communication annuel", "La structure juridique de l'entreprise"], correcte: 1 },
    { id: "Q2", question: "Le Business Model Canvas est un outil qui permet de :", options: ["Calculer les impôts", "Visualiser et structurer les composantes clés d'un modèle économique", "Rédiger un contrat commercial", "Gérer les ressources humaines"], correcte: 1 },
    { id: "Q3", question: "Un segment de clientèle bien défini permet de :", options: ["Vendre à tout le monde", "Concentrer ses efforts sur les clients à plus forte valeur", "Réduire la gamme de produits", "Augmenter les coûts de production"], correcte: 1 },
  ],
  M25: [
    { id: "Q1", question: "Le positionnement d'une offre définit :", options: ["Le prix de vente uniquement", "Comment votre offre est perçue par rapport à la concurrence", "La couleur de votre logo", "Votre réseau de distribution"], correcte: 1 },
    { id: "Q2", question: "Une offre de valeur percutante répond à :", options: ["Ce que vous voulez vendre", "Le problème précis que vous résolvez pour votre client cible", "Les tendances du marché uniquement", "Les exigences des fournisseurs"], correcte: 1 },
    { id: "Q3", question: "Se différencier de la concurrence passe par :", options: ["Copier les meilleures pratiques du secteur", "Identifier et valoriser ce qui vous rend unique et pertinent", "Baisser systématiquement les prix", "Proposer plus de produits que les concurrents"], correcte: 1 },
  ],
  M26: [
    { id: "Q1", question: "Un plan d'action 90 jours est efficace car il :", options: ["Est trop court pour avoir un impact", "Crée un horizon proche favorisant l'action et la mesure des résultats", "Remplace le plan stratégique annuel", "Ne s'applique qu'aux startups"], correcte: 1 },
    { id: "Q2", question: "La priorisation des actions doit se faire selon :", options: ["L'ordre alphabétique", "L'impact potentiel et l'urgence de chaque action", "Les préférences personnelles uniquement", "Le coût le plus bas"], correcte: 1 },
    { id: "Q3", question: "Pour suivre l'exécution d'un plan d'action, on utilise :", options: ["Sa mémoire uniquement", "Un tableau de suivi avec indicateurs et responsables clairement définis", "Des réunions hebdomadaires sans compte-rendu", "Des objectifs annuels non découpés"], correcte: 1 },
  ],
  M27: [
    { id: "Q1", question: "La structuration stratégique d'une activité est un processus :", options: ["Ponctuel, à faire une seule fois à la création", "Continu, à réviser régulièrement selon l'évolution du marché", "Réservé aux grandes entreprises", "Uniquement utile en période de crise"], correcte: 1 },
    { id: "Q2", question: "Aligner stratégie, offre et actions opérationnelles permet de :", options: ["Réduire le nombre d'employés", "Maximiser la cohérence et l'efficacité de l'entreprise", "Éliminer toute prise de risque", "Garantir des bénéfices immédiats"], correcte: 1 },
    { id: "Q3", question: "Le principal obstacle à la structuration stratégique est :", options: ["Le manque de budget", "L'absence de clarté sur sa vision et ses priorités", "La taille de l'équipe", "Les contraintes réglementaires"], correcte: 1 },
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

