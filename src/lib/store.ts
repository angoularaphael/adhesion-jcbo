import {
  mockActualites,
  mockConversations,
  mockAdherents,
  mockAdmin,
  mockRessources,
  mockAdhesion,
  mockCertificat,
  mockStats,
  mockCours,
  mockProgressions,
} from "../data/mock";

export type AbonnementInfo = { plan: string; statut: "actif" | "inactif"; dateDebut: string };

export type Notification = {
  id: string;
  adherentEmail: string;
  type: "paiement" | "inscription" | "abonnement" | "rappel" | "certificat";
  titre: string;
  message: string;
  date: string;
  lue: boolean;
};

export type Paiement = {
  id: string;
  adherentEmail: string;
  coursId: string;
  coursTitre: string;
  montant: number;
  date: string;
  stripeSessionId: string;
  numerTransaction: string;
};

// Utilise globalThis pour survivre aux rechargements de modules (Vite dev + Vercel warm starts)
export type AdherentComplet = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  telephone: string;
  entreprise: string;
  secteur: string;
  statut: "Actif" | "Inactif";
  dateAdhesion: string;
  numeroAdherent: string;
  coursInscrits: string[];
  abonnement: AbonnementInfo | null;
};

export type QuizResultat = { moduleId: string; score: number; passe: boolean };

export type ProgressionComplet = {
  adherentEmail: string;
  coursId: string;
  modulesTermines: string[];
  quizResultats: QuizResultat[];
  dateDebut: string;
};

type StoreData = {
  adminMotDePasse: string;
  actualites: { id: string; titre: string; contenu: string; statut: string; date: string }[];
  conversations: {
    id: string; email: string; adherent: string; entreprise: string;
    sujet: string; dernier_message: string; date: string; non_lu: number; non_lu_adherent: number;
    messages: { de: string; texte: string; heure: string }[];
  }[];
  adherents: AdherentComplet[];
  ressources: { id: string; titre: string; categorie: string; date: string; fichier: string; nom_fichier?: string }[];
  cours: typeof mockCours;
  progressions: ProgressionComplet[];
  paiements: Paiement[];
  notifications: Notification[];
};

const g = globalThis as unknown as Record<string, StoreData | undefined>;

function initStore(): StoreData {
  return {
    adminMotDePasse: mockAdmin.motDePasse,
    actualites: mockActualites.map(a => ({ ...a })),
    conversations: mockConversations.map(c => ({ ...c, messages: c.messages.map(m => ({ ...m })) })),
    adherents: mockAdherents.map(a => ({ ...a, coursInscrits: [...a.coursInscrits] })),
    ressources: mockRessources.map(r => ({ ...r })),
    cours: mockCours.map(c => ({ ...c, modules: c.modules.map(m => ({ ...m })) })),
    progressions: mockProgressions.map(p => ({
      ...p,
      modulesTermines: [...p.modulesTermines],
      quizResultats: (p.quizResultats ?? []).map(q => ({ ...q })),
    })),
    paiements: [],
    notifications: [],
  };
}

if (!g.__jcboStore || !g.__jcboStore.adherents) g.__jcboStore = initStore();

const s = () => g.__jcboStore as StoreData;

// --- Actualités ---
export function getActualites() { return s().actualites; }

export function createActualite(data: { titre: string; contenu: string; statut: "Publié" | "Brouillon" }) {
  const item = { id: `ACT-${Date.now()}`, ...data, date: new Date().toISOString().split("T")[0] };
  s().actualites.unshift(item);
  return item;
}

export function updateActualite(id: string, data: { titre?: string; contenu?: string; statut?: string }) {
  const arr = s().actualites;
  const index = arr.findIndex(a => a.id === id);
  if (index === -1) return null;
  arr[index] = { ...arr[index], ...data };
  return arr[index];
}

export function deleteActualite(id: string): boolean {
  const arr = s().actualites;
  const index = arr.findIndex(a => a.id === id);
  if (index === -1) return false;
  arr.splice(index, 1);
  return true;
}

// --- Adhérents (modèle unifié) ---
export function getAdherents() { return s().adherents; }

export function getAdherentByEmail(email: string): AdherentComplet | null {
  return s().adherents.find(a => a.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function getAdherentById(id: string): AdherentComplet | null {
  return s().adherents.find(a => a.id === id) ?? null;
}

export function createAdherent(data: Omit<AdherentComplet, "id" | "numeroAdherent" | "dateAdhesion">) {
  const arr = s().adherents;
  const num = String(arr.length + 1).padStart(4, "0");
  const item: AdherentComplet = {
    id: `ADH-${Date.now()}`,
    numeroAdherent: `ADH-${new Date().getFullYear()}-${num}`,
    dateAdhesion: new Date().toISOString().split("T")[0],
    ...data,
    email: data.email.toLowerCase(),
    coursInscrits: data.coursInscrits ?? [],
    abonnement: data.abonnement ?? null,
  };
  arr.push(item);
  return item;
}

export function setAbonnement(adherentId: string, plan: string): AdherentComplet | null {
  const a = s().adherents.find(a => a.id === adherentId);
  if (!a) return null;
  a.abonnement = { plan, statut: "actif", dateDebut: new Date().toISOString().split("T")[0] };
  return a;
}

export function cancelAbonnement(adherentId: string): AdherentComplet | null {
  const a = s().adherents.find(a => a.id === adherentId);
  if (!a || !a.abonnement) return null;
  a.abonnement.statut = "inactif";
  return a;
}

export function updateAdherent(id: string, data: Partial<Omit<AdherentComplet, "id">>) {
  const arr = s().adherents;
  const index = arr.findIndex(a => a.id === id);
  if (index === -1) return null;
  arr[index] = { ...arr[index], ...data };
  return arr[index];
}

export function deleteAdherent(id: string): boolean {
  const arr = s().adherents;
  const index = arr.findIndex(a => a.id === id);
  if (index === -1) return false;
  arr.splice(index, 1);
  return true;
}

export function setCoursAdherent(id: string, coursInscrits: string[]) {
  const a = s().adherents.find(a => a.id === id);
  if (!a) return null;
  a.coursInscrits = coursInscrits;
  return a;
}

// Compatibilité identifiants page
export function getIdentifiants() {
  return s().adherents.map(a => ({
    id: a.id,
    nom: `${a.prenom} ${a.nom}`,
    email: a.email,
    cree_le: a.dateAdhesion,
    statut: a.statut,
  }));
}

export function createIdentifiant(data: { nom: string; email: string }) {
  const charset = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!";
  let password = "";
  for (let i = 0; i < 12; i++) password += charset[Math.floor(Math.random() * charset.length)];
  const parts = data.nom.trim().split(" ");
  const prenom = parts[0] ?? data.nom;
  const nom = parts.slice(1).join(" ") || prenom;
  const created = createAdherent({
    prenom, nom,
    email: data.email,
    motDePasse: password,
    telephone: "", entreprise: "", secteur: "",
    statut: "Actif",
    coursInscrits: [],
    abonnement: null,
  });
  return { ...created, nom: data.nom, motDePasse: password };
}

export function toggleIdentifiantStatut(id: string) {
  const a = s().adherents.find(a => a.id === id);
  if (!a) return null;
  a.statut = a.statut === "Actif" ? "Inactif" : "Actif";
  return { id: a.id, nom: `${a.prenom} ${a.nom}`, email: a.email, cree_le: a.dateAdhesion, statut: a.statut };
}

// Profil adhérent (compatibilité)
export function getProfil(email?: string) {
  if (email) return getAdherentByEmail(email);
  return s().adherents[0] ?? null;
}

export function updateProfil(email: string, data: Partial<Pick<AdherentComplet, "telephone" | "entreprise" | "secteur" | "motDePasse">>) {
  const arr = s().adherents;
  const index = arr.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
  if (index === -1) return null;
  arr[index] = { ...arr[index], ...data };
  return arr[index];
}

// --- Mots de passe ---
export function getAdminMotDePasse() { return s().adminMotDePasse; }
export function setAdminMotDePasse(pwd: string) { s().adminMotDePasse = pwd; }

// --- Messagerie ---
export function getConversations() { return s().conversations; }
export function getConversation(id: string) { return s().conversations.find(c => c.id === id) || null; }

export function addMessage(conversationId: string, texte: string, de: "admin" | "adherent") {
  const conv = s().conversations.find(c => c.id === conversationId);
  if (!conv) return null;
  const now = new Date();
  const heure = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
  const msg = { de, texte, heure };
  conv.messages.push(msg);
  conv.dernier_message = texte;
  conv.date = now.toISOString().split("T")[0];
  if (de === "adherent") conv.non_lu++;
  if (de === "admin") conv.non_lu_adherent++;
  return msg;
}

export function markAsRead(conversationId: string) {
  const conv = s().conversations.find(c => c.id === conversationId);
  if (conv) conv.non_lu = 0;
}

export function markAsReadAdherent(conversationId: string) {
  const conv = s().conversations.find(c => c.id === conversationId);
  if (conv) conv.non_lu_adherent = 0;
}

export function findOrCreateConversation(email: string, sujet: string) {
  const emailLower = email.toLowerCase();
  let conv = s().conversations.find(c => c.email === emailLower);
  if (!conv) {
    const adherent = getAdherentByEmail(emailLower);
    const adherentNom = adherent
      ? `${adherent.prenom} ${adherent.nom}`
      : emailLower.split("@")[0].replace(/[._]/g, " ");
    const entreprise = adherent?.entreprise ?? "";
    conv = {
      id: `MSG-${String(s().conversations.length + 1).padStart(3, "0")}`,
      email: emailLower, adherent: adherentNom, entreprise,
      sujet, dernier_message: "", date: new Date().toISOString().split("T")[0],
      non_lu: 0, non_lu_adherent: 0, messages: [],
    };
    s().conversations.push(conv);
  }
  return conv;
}

// --- Ressources ---
export function getRessources() { return s().ressources; }

export function createRessource(data: { titre: string; categorie: string; fichier: string; nom_fichier?: string }) {
  const item = { id: `RES-${Date.now()}`, ...data, date: new Date().toISOString().split("T")[0] };
  s().ressources.push(item);
  return item;
}

export function updateRessource(id: string, data: Partial<{ titre: string; categorie: string; fichier: string; nom_fichier: string }>) {
  const arr = s().ressources;
  const index = arr.findIndex(r => r.id === id);
  if (index === -1) return null;
  arr[index] = { ...arr[index], ...data };
  return arr[index];
}

export function deleteRessource(id: string): boolean {
  const arr = s().ressources;
  const index = arr.findIndex(r => r.id === id);
  if (index === -1) return false;
  arr.splice(index, 1);
  return true;
}

export function getRessource(id: string) {
  return s().ressources.find(r => r.id === id) ?? null;
}

// --- Adhésion (données fixes) ---
export function getAdhesion() { return { ...mockAdhesion }; }
export function getCertificat() { return { ...mockCertificat }; }

// --- Statistiques dynamiques ---
export function getStats() {
  const adh = s().adherents;
  return {
    ...mockStats,
    totalAdherents: adh.length,
    adherentsActifs: adh.filter(a => a.statut === "Actif").length,
    nouveauxCeMois: mockStats.nouveauxCeMois,
    tauxRenouvellement: mockStats.tauxRenouvellement,
  };
}

// --- Cours ---
export function getCours() { return s().cours; }

export function createCours(data: {
  titre: string; description: string; duree: string;
  niveau: "Débutant" | "Intermédiaire" | "Avancé"; statut: "Publié" | "Brouillon";
}) {
  const item = {
    id: `COURS-${Date.now()}`,
    ...data,
    date: new Date().toISOString().split("T")[0],
    modules: [] as typeof mockCours[number]["modules"],
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (s().cours as any[]).push(item);
  return item;
}

export function updateCours(id: string, data: Partial<{ titre: string; description: string; duree: string; niveau: string; statut: string }>) {
  const arr = s().cours;
  const index = arr.findIndex(c => c.id === id);
  if (index === -1) return null;
  arr[index] = { ...arr[index], ...data } as typeof arr[number];
  return arr[index];
}

export function deleteCours(id: string): boolean {
  const arr = s().cours;
  const index = arr.findIndex(c => c.id === id);
  if (index === -1) return false;
  arr.splice(index, 1);
  return true;
}

// --- Progressions ---
export function getProgressions(adherentEmail?: string) {
  if (adherentEmail) return s().progressions.filter(p => p.adherentEmail === adherentEmail.toLowerCase());
  return s().progressions;
}

function getOrCreateProgression(email: string, coursId: string): ProgressionComplet {
  let prog = s().progressions.find(p => p.adherentEmail === email && p.coursId === coursId);
  if (!prog) {
    prog = { adherentEmail: email, coursId, modulesTermines: [], quizResultats: [], dateDebut: new Date().toISOString().split("T")[0] };
    s().progressions.push(prog);
  }
  if (!prog.quizResultats) prog.quizResultats = [];
  return prog;
}

export function marquerModuleTermine(adherentEmail: string, coursId: string, moduleId: string) {
  const email = adherentEmail.toLowerCase();
  const prog = getOrCreateProgression(email, coursId);

  if (!prog.modulesTermines.includes(moduleId)) {
    prog.modulesTermines.push(moduleId);
  }

  const cours = s().cours.find(c => c.id === coursId);
  const totalModules = cours?.modules.length ?? 1;
  const pourcentage = Math.round((prog.modulesTermines.length / totalModules) * 100);

  return { ...prog, pourcentage };
}

export function enregistrerQuizResultat(adherentEmail: string, coursId: string, moduleId: string, score: number, passe: boolean) {
  const email = adherentEmail.toLowerCase();
  const prog = getOrCreateProgression(email, coursId);

  const idx = prog.quizResultats.findIndex(q => q.moduleId === moduleId);
  const resultat = { moduleId, score, passe };
  if (idx === -1) prog.quizResultats.push(resultat);
  else prog.quizResultats[idx] = resultat;

  if (passe && !prog.modulesTermines.includes(moduleId)) {
    prog.modulesTermines.push(moduleId);
  }

  const cours = s().cours.find(c => c.id === coursId);
  const totalModules = cours?.modules.length ?? 1;
  const pourcentage = Math.round((prog.modulesTermines.length / totalModules) * 100);
  const coursTermine = pourcentage === 100 && prog.quizResultats.filter(q => q.passe).length >= totalModules;

  return { ...prog, pourcentage, coursTermine };
}

export function getProgressionPourcentage(adherentEmail: string, coursId: string): number {
  const prog = s().progressions.find(p => p.adherentEmail === adherentEmail.toLowerCase() && p.coursId === coursId);
  if (!prog) return 0;
  const cours = s().cours.find(c => c.id === coursId);
  const totalModules = cours?.modules.length ?? 1;
  return Math.round((prog.modulesTermines.length / totalModules) * 100);
}

// --- Paiements ---
export function getPaiements(adherentEmail?: string): Paiement[] {
  if (adherentEmail) return s().paiements.filter(p => p.adherentEmail === adherentEmail.toLowerCase());
  return s().paiements;
}

export function getPaiementParSession(stripeSessionId: string): Paiement | null {
  return s().paiements.find(p => p.stripeSessionId === stripeSessionId) ?? null;
}

export function enregistrerPaiement(data: Omit<Paiement, "id" | "date" | "numerTransaction">): Paiement {
  const num = String(s().paiements.length + 1).padStart(6, "0");
  const paiement: Paiement = {
    id: `PAY-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    numerTransaction: `TXN-${new Date().getFullYear()}-${num}`,
    ...data,
    adherentEmail: data.adherentEmail.toLowerCase(),
  };
  s().paiements.push(paiement);
  return paiement;
}

// --- Notifications ---
export function getNotifications(adherentEmail: string): Notification[] {
  return s().notifications
    .filter(n => n.adherentEmail === adherentEmail.toLowerCase())
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getNonLuCount(adherentEmail: string): number {
  return s().notifications.filter(n => n.adherentEmail === adherentEmail.toLowerCase() && !n.lue).length;
}

export function addNotification(data: Omit<Notification, "id" | "date" | "lue">): Notification {
  const notif: Notification = {
    id: `NOTIF-${Date.now()}`,
    date: new Date().toISOString(),
    lue: false,
    ...data,
    adherentEmail: data.adherentEmail.toLowerCase(),
  };
  s().notifications.push(notif);
  return notif;
}

export function marquerNotificationsLues(adherentEmail: string): void {
  s().notifications
    .filter(n => n.adherentEmail === adherentEmail.toLowerCase())
    .forEach(n => { n.lue = true; });
}

export function getCoursTermines(adherentEmail: string): string[] {
  const email = adherentEmail.toLowerCase();
  return s().progressions
    .filter(p => {
      if (p.adherentEmail !== email) return false;
      const cours = s().cours.find(c => c.id === p.coursId);
      if (!cours) return false;
      const total = cours.modules.length;
      return p.modulesTermines.length >= total && p.quizResultats.filter(q => q.passe).length >= total;
    })
    .map(p => p.coursId);
}
