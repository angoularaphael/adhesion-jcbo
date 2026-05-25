import { getSupabase } from "./supabase";
import { hashPassword } from "./password";
import { normalizeCloudinaryDeliveryUrl } from "./cloudinary";
import { isSupabaseFileRef } from "./module-fichier";

// ── Re-exported types (unchanged surface for callers) ─────────────────────────

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
  provider?: string;
  fapshiTransactionId?: string;
};

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
  photoUrl: string;
};

export type QuizResultat = { moduleId: string; score: number; passe: boolean };

export type ProgressionComplet = {
  adherentEmail: string;
  coursId: string;
  modulesTermines: string[];
  quizResultats: QuizResultat[];
  dateDebut: string;
};

export type CertificatEmis = {
  id: string;
  adherentEmail: string;
  coursId: string;
  numero: string;
  programmeCode: string;
  niveauCode: string;
  annee: number;
  dateEmission: string;
  coursTitre: string;
  coursNiveau: string;
  competences: string[];
  certificatIntro: string;
  certificatCode: string;
  quizScore?: number | null;
};

export type CertificatSnapshot = {
  titre: string;
  niveau: string;
  competences?: string[];
  certificatIntro?: string;
  certificatCode?: string;
  quizScore?: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toAdherent(row: any): AdherentComplet {
  return {
    id: row.id,
    prenom: row.prenom,
    nom: row.nom,
    email: row.email,
    motDePasse: row.mot_de_passe,
    telephone: row.telephone ?? "",
    entreprise: row.entreprise ?? "",
    secteur: row.secteur ?? "",
    statut: row.statut as "Actif" | "Inactif",
    dateAdhesion: row.date_adhesion,
    numeroAdherent: row.numero_adherent,
    coursInscrits: row.cours_inscrits ?? [],
    abonnement: row.abonnement_plan
      ? { plan: row.abonnement_plan, statut: row.abonnement_statut as "actif" | "inactif", dateDebut: row.abonnement_date_debut }
      : null,
    photoUrl: row.photo_url ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toNotification(row: any): Notification {
  return {
    id: row.id,
    adherentEmail: row.adherent_email,
    type: row.type as Notification["type"],
    titre: row.titre,
    message: row.message,
    date: row.date,
    lue: row.lue,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPaiement(row: any): Paiement {
  return {
    id: row.id,
    adherentEmail: row.adherent_email,
    coursId: row.cours_id,
    coursTitre: row.cours_titre,
    montant: Number(row.montant),
    date: row.date,
    stripeSessionId: row.stripe_session_id ?? "",
    numerTransaction: row.numer_transaction,
    provider: row.provider,
    fapshiTransactionId: row.fapshi_transaction_id,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCours(row: any, modules: any[] = []) {
  return {
    id: row.id,
    titre: row.titre,
    description: row.description,
    duree: row.duree,
    niveau: row.niveau as "Débutant" | "Intermédiaire" | "Avancé",
    statut: row.statut as "Publié" | "Brouillon",
    prix: row.prix !== null ? Number(row.prix) : undefined,
    competences: (row.competences as string[] | null) ?? [],
    certificatIntro: row.certificat_intro ?? "",
    certificatCode: row.certificat_code ?? "",
    date: row.date,
    modules: modules
      .filter((m: any) => m.cours_id === row.id)
      .sort((a: any, b: any) => a.ordre - b.ordre)
      .map((m: any) => ({
        id: m.id,
        titre: m.titre,
        duree: m.duree,
        type: m.type as "Vidéo" | "Document" | "Quiz",
        ordre: m.ordre,
        fichierUrl: m.fichier_url
          ? isSupabaseFileRef(m.fichier_url)
            ? m.fichier_url
            : normalizeCloudinaryDeliveryUrl(m.fichier_url)
          : undefined,
        videoUrl: m.video_url ?? undefined,
        contenuMd: m.contenu_md ?? undefined,
      })),
  };
}

// ── Actualités ────────────────────────────────────────────────────────────────

export type Actualite = import("./database.types").DbActualite;

export async function getActualites(): Promise<Actualite[]> {
  const { data } = await getSupabase().from("actualites").select("*").order("date", { ascending: false });
  return data ?? ([] as Actualite[]);
}

export async function createActualite(data: {
  titre: string;
  contenu: string;
  statut: "Publié" | "Brouillon";
  categorie?: string;
  extrait?: string;
  image_url?: string;
  slug?: string;
}) {
  const { uniqueSlug } = await import("./store-admin");
  const slug = data.slug ?? await uniqueSlug(data.titre, async (s) => {
    const { data: ex } = await getSupabase().from("actualites").select("id").eq("slug", s).maybeSingle();
    return !!ex;
  });
  const item = {
    id: `ACT-${Date.now()}`,
    titre: data.titre,
    contenu: data.contenu,
    statut: data.statut,
    categorie: data.categorie ?? "Actualité",
    extrait: data.extrait ?? data.contenu.slice(0, 200),
    image_url: data.image_url ?? null,
    slug,
    date: new Date().toISOString().split("T")[0],
  };
  await getSupabase().from("actualites").insert(item);
  return item;
}

export async function updateActualite(
  id: string,
  data: {
    titre?: string;
    contenu?: string;
    statut?: string;
    categorie?: string;
    extrait?: string;
    image_url?: string | null;
    slug?: string;
  }
) {
  const { data: row } = await getSupabase().from("actualites").update(data).eq("id", id).select().single();
  return row ?? null;
}

export async function deleteActualite(id: string): Promise<boolean> {
  const { error } = await getSupabase().from("actualites").delete().eq("id", id);
  return !error;
}

// ── Adhérents ─────────────────────────────────────────────────────────────────

export async function getAdherents(): Promise<AdherentComplet[]> {
  const { data } = await getSupabase().from("adherents").select("*").order("date_adhesion", { ascending: false });
  return (data ?? []).map(toAdherent);
}

export async function getAdherentByEmail(email: string): Promise<AdherentComplet | null> {
  const { data } = await getSupabase().from("adherents").select("*").ilike("email", email).maybeSingle();
  return data ? toAdherent(data) : null;
}

export async function getAdherentById(id: string): Promise<AdherentComplet | null> {
  const { data } = await getSupabase().from("adherents").select("*").eq("id", id).maybeSingle();
  return data ? toAdherent(data) : null;
}

export async function createAdherent(data: Omit<AdherentComplet, "id" | "numeroAdherent" | "dateAdhesion">): Promise<AdherentComplet> {
  const { count } = await getSupabase().from("adherents").select("id", { count: "exact", head: true });
  const num = String((count ?? 0) + 1).padStart(4, "0");
  const row = {
    id: `ADH-${Date.now()}`,
    numero_adherent: `ADH-${new Date().getFullYear()}-${num}`,
    date_adhesion: new Date().toISOString().split("T")[0],
    prenom: data.prenom,
    nom: data.nom,
    email: data.email.toLowerCase(),
    mot_de_passe: await hashPassword(data.motDePasse),
    telephone: data.telephone ?? "",
    entreprise: data.entreprise ?? "",
    secteur: data.secteur ?? "",
    statut: data.statut ?? "Actif",
    cours_inscrits: data.coursInscrits ?? [],
    abonnement_plan: data.abonnement?.plan ?? null,
    abonnement_statut: data.abonnement?.statut ?? null,
    abonnement_date_debut: data.abonnement?.dateDebut ?? null,
  };
  await getSupabase().from("adherents").insert(row);
  return toAdherent(row);
}

export async function updateAdherent(id: string, data: Partial<Omit<AdherentComplet, "id">>): Promise<AdherentComplet | null> {
  const patch: Record<string, unknown> = {};
  if (data.prenom !== undefined) patch.prenom = data.prenom;
  if (data.nom !== undefined) patch.nom = data.nom;
  if (data.email !== undefined) patch.email = data.email.toLowerCase();
  if (data.motDePasse !== undefined) patch.mot_de_passe = await hashPassword(data.motDePasse);
  if (data.telephone !== undefined) patch.telephone = data.telephone;
  if (data.entreprise !== undefined) patch.entreprise = data.entreprise;
  if (data.secteur !== undefined) patch.secteur = data.secteur;
  if (data.statut !== undefined) patch.statut = data.statut;
  if (data.coursInscrits !== undefined) patch.cours_inscrits = data.coursInscrits;
  if (data.abonnement !== undefined) {
    patch.abonnement_plan = data.abonnement?.plan ?? null;
    patch.abonnement_statut = data.abonnement?.statut ?? null;
    patch.abonnement_date_debut = data.abonnement?.dateDebut ?? null;
  }
  const { data: row } = await getSupabase().from("adherents").update(patch).eq("id", id).select().single();
  return row ? toAdherent(row) : null;
}

export async function deleteAdherent(id: string): Promise<boolean> {
  const { error } = await getSupabase().from("adherents").delete().eq("id", id);
  return !error;
}

export async function setCoursAdherent(id: string, coursInscrits: string[]): Promise<AdherentComplet | null> {
  const { data } = await getSupabase().from("adherents").update({ cours_inscrits: coursInscrits }).eq("id", id).select().single();
  return data ? toAdherent(data) : null;
}

export async function setAbonnement(adherentId: string, plan: string): Promise<AdherentComplet | null> {
  const { data } = await getSupabase().from("adherents").update({
    abonnement_plan: plan,
    abonnement_statut: "actif",
    abonnement_date_debut: new Date().toISOString().split("T")[0],
  }).eq("id", adherentId).select().single();
  return data ? toAdherent(data) : null;
}

export async function cancelAbonnement(adherentId: string): Promise<AdherentComplet | null> {
  const { data } = await getSupabase().from("adherents").update({ abonnement_statut: "inactif" }).eq("id", adherentId).select().single();
  return data ? toAdherent(data) : null;
}

// Compatibilité page identifiants
export async function getIdentifiants() {
  const adhs = await getAdherents();
  return adhs.map(a => ({ id: a.id, nom: `${a.prenom} ${a.nom}`, email: a.email, cree_le: a.dateAdhesion, statut: a.statut }));
}

export async function createIdentifiant(data: { nom: string; email: string }) {
  const charset = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!";
  let password = "";
  for (let i = 0; i < 12; i++) password += charset[Math.floor(Math.random() * charset.length)];
  const parts = data.nom.trim().split(" ");
  const prenom = parts[0] ?? data.nom;
  const nom = parts.slice(1).join(" ") || prenom;
  const created = await createAdherent({
    prenom, nom, email: data.email, motDePasse: password,
    telephone: "", entreprise: "", secteur: "", statut: "Actif",
    coursInscrits: [], abonnement: null,
  });
  return { ...created, nom: data.nom, motDePasse: password };
}

export async function resetMotDePasse(adherentId: string): Promise<{ email: string; nom: string; motDePasse: string } | null> {
  const a = await getAdherentById(adherentId);
  if (!a) return null;
  const charset = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!";
  let password = "";
  for (let i = 0; i < 12; i++) password += charset[Math.floor(Math.random() * charset.length)];
  // On réactive l'adhérent lors de la régénération des identifiants : sinon
  // l'utilisateur ne pourrait jamais se reconnecter avec le nouveau mot de passe
  // (le login refuse les comptes inactifs).
  await getSupabase()
    .from("adherents")
    .update({ mot_de_passe: await hashPassword(password), statut: "Actif" })
    .eq("id", adherentId);
  return { email: a.email, nom: `${a.prenom} ${a.nom}`, motDePasse: password };
}

export async function toggleIdentifiantStatut(id: string) {
  const a = await getAdherentById(id);
  if (!a) return null;
  const newStatut = a.statut === "Actif" ? "Inactif" : "Actif";
  await getSupabase().from("adherents").update({ statut: newStatut }).eq("id", id);
  return { id, nom: `${a.prenom} ${a.nom}`, email: a.email, cree_le: a.dateAdhesion, statut: newStatut };
}

export async function getProfil(email?: string): Promise<AdherentComplet | null> {
  if (email) return getAdherentByEmail(email);
  const { data } = await getSupabase().from("adherents").select("*").limit(1).single();
  return data ? toAdherent(data) : null;
}

export async function updateProfil(email: string, data: Partial<Pick<AdherentComplet, "telephone" | "entreprise" | "secteur" | "motDePasse" | "photoUrl">>) {
  const patch: Record<string, unknown> = {};
  if (data.telephone !== undefined) patch.telephone = data.telephone;
  if (data.entreprise !== undefined) patch.entreprise = data.entreprise;
  if (data.secteur !== undefined) patch.secteur = data.secteur;
  if (data.motDePasse !== undefined) patch.mot_de_passe = await hashPassword(data.motDePasse);
  if (data.photoUrl !== undefined) patch.photo_url = data.photoUrl;
  const { data: row } = await getSupabase().from("adherents").update(patch).ilike("email", email).select().single();
  return row ? toAdherent(row) : null;
}

// ── Admin password ────────────────────────────────────────────────────────────

export async function getAdminMotDePasse(): Promise<string> {
  const { data } = await getSupabase().from("config").select("valeur").eq("cle", "admin_mot_de_passe").single();
  return data?.valeur ?? "Jcbo2025!";
}

export async function setAdminMotDePasse(pwd: string): Promise<void> {
  await getSupabase().from("config").upsert({ cle: "admin_mot_de_passe", valeur: pwd });
}

// ── Messagerie ────────────────────────────────────────────────────────────────

export async function getConversations() {
  const { data: convs } = await getSupabase().from("conversations").select("*").order("date", { ascending: false });
  const { data: msgs } = await getSupabase().from("messages").select("*").order("created_at", { ascending: true });
  return (convs ?? []).map(c => ({
    ...c,
    messages: (msgs ?? []).filter(m => m.conversation_id === c.id).map(m => ({ de: m.de, texte: m.texte, heure: m.heure })),
  }));
}

export async function getConversation(id: string) {
  const { data: conv } = await getSupabase().from("conversations").select("*").eq("id", id).maybeSingle();
  if (!conv) return null;
  const { data: msgs } = await getSupabase().from("messages").select("*").eq("conversation_id", id).order("created_at", { ascending: true });
  return { ...conv, messages: (msgs ?? []).map(m => ({ de: m.de, texte: m.texte, heure: m.heure })) };
}

export async function addMessage(conversationId: string, texte: string, de: "admin" | "adherent") {
  const now = new Date();
  const heure = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
  const msg = { conversation_id: conversationId, de, texte, heure };
  await getSupabase().from("messages").insert(msg);
  const patch: Record<string, unknown> = {
    dernier_message: texte,
    date: now.toISOString().split("T")[0],
  };
  if (de === "adherent") {
    const { data: c } = await getSupabase().from("conversations").select("non_lu").eq("id", conversationId).single();
    patch.non_lu = (c?.non_lu ?? 0) + 1;
  } else {
    const { data: c } = await getSupabase().from("conversations").select("non_lu_adherent").eq("id", conversationId).single();
    patch.non_lu_adherent = (c?.non_lu_adherent ?? 0) + 1;
  }
  await getSupabase().from("conversations").update(patch).eq("id", conversationId);
  return { de, texte, heure };
}

export async function markAsRead(conversationId: string) {
  await getSupabase().from("conversations").update({ non_lu: 0 }).eq("id", conversationId);
}

export async function markAsReadAdherent(conversationId: string) {
  await getSupabase().from("conversations").update({ non_lu_adherent: 0 }).eq("id", conversationId);
}

export async function findOrCreateConversation(email: string, sujet: string) {
  const emailLower = email.toLowerCase();
  const { data: existing } = await getSupabase().from("conversations").select("*").eq("email", emailLower).maybeSingle();
  if (existing) {
    const { data: msgs } = await getSupabase().from("messages").select("*").eq("conversation_id", existing.id).order("created_at", { ascending: true });
    return { ...existing, messages: (msgs ?? []).map(m => ({ de: m.de, texte: m.texte, heure: m.heure })) };
  }
  const adherent = await getAdherentByEmail(emailLower);
  const adherentNom = adherent
    ? `${adherent.prenom} ${adherent.nom}`
    : emailLower.split("@")[0].replace(/[._]/g, " ");
  const { count } = await getSupabase().from("conversations").select("id", { count: "exact", head: true });
  const newConv = {
    id: `MSG-${String((count ?? 0) + 1).padStart(3, "0")}`,
    email: emailLower,
    adherent: adherentNom,
    entreprise: adherent?.entreprise ?? "",
    sujet,
    dernier_message: "",
    date: new Date().toISOString().split("T")[0],
    non_lu: 0,
    non_lu_adherent: 0,
  };
  await getSupabase().from("conversations").insert(newConv);
  return { ...newConv, messages: [] };
}

// ── Ressources ────────────────────────────────────────────────────────────────

export async function getRessources() {
  const { data } = await getSupabase().from("ressources").select("*").order("date", { ascending: false });
  return data ?? [];
}

export async function getRessource(id: string) {
  const { data } = await getSupabase().from("ressources").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

export async function createRessource(data: {
  titre: string;
  categorie: string;
  fichier: string;
  nom_fichier?: string;
  description?: string;
  affiche_vitrine?: boolean;
}) {
  const item = {
    id: `RES-${Date.now()}`,
    ...data,
    description: data.description ?? "",
    affiche_vitrine: data.affiche_vitrine ?? false,
    date: new Date().toISOString().split("T")[0],
  };
  await getSupabase().from("ressources").insert(item);
  return item;
}

export async function getRessourcesVitrine() {
  const { data } = await getSupabase()
    .from("ressources")
    .select("id, titre, categorie, date, description, nom_fichier")
    .eq("affiche_vitrine", true)
    .order("date", { ascending: false });
  return data ?? [];
}

export async function updateRessource(id: string, data: Partial<{
  titre: string;
  categorie: string;
  fichier: string;
  nom_fichier: string;
  description: string;
  affiche_vitrine: boolean;
}>) {
  const { data: row } = await getSupabase().from("ressources").update(data).eq("id", id).select().single();
  return row ?? null;
}

export async function deleteRessource(id: string): Promise<boolean> {
  const { error } = await getSupabase().from("ressources").delete().eq("id", id);
  return !error;
}

// ── Adhésion ──────────────────────────────────────────────────────────────────

export async function getAdhesion(email: string) {
  const adherent = await getAdherentByEmail(email);
  if (!adherent) return null;
  const { data: paiements } = await getSupabase()
    .from("paiements")
    .select("*")
    .eq("adherent_email", email.toLowerCase())
    .order("date", { ascending: false });
  const cours = adherent.coursInscrits[0]
    ? await getCoursById(adherent.coursInscrits[0])
    : null;
  const dateFin = new Date(adherent.dateAdhesion);
  dateFin.setFullYear(dateFin.getFullYear() + 1);
  return {
    numero: adherent.numeroAdherent,
    statut: adherent.statut === "Actif" ? "active" : "inactive",
    dateDebut: adherent.dateAdhesion,
    dateFin: dateFin.toISOString().split("T")[0],
    programme: cours?.titre ?? "Programme JCBO",
    abonnement: adherent.abonnement,
    paiements: (paiements ?? []).map((p) => ({
      id: p.id,
      date: p.date,
      montant: Number(p.montant),
      methode: (p.provider === "fapshi" || p.provider === "notchpay") ? "OM/MoMo" : "Carte",
      reference: p.numer_transaction,
    })),
  };
}

export async function getCertificatCompetences(email: string, coursId: string) {
  const cours = await getCoursById(coursId);
  const cert = await getCertificatAdherent(email, coursId);
  const adherent = await getAdherentByEmail(email);
  if (!adherent) return null;
  const titre = cert?.coursTitre || cours?.titre;
  if (!titre) return null;
  const code = cert?.programmeCode ?? cert?.certificatCode ?? getProgrammeCode(titre);
  const officielles = getCompetencesProgramme(code);
  const storedCompetences = cert?.competences?.length ? cert.competences : [];
  return {
    nom: `${adherent.prenom} ${adherent.nom}`,
    programme: titre,
    programmeCode: code,
    numero: cert?.numero ?? "",
    dateDelivrance: cert?.dateEmission ?? "",
    competences: storedCompetences.length
      ? storedCompetences
      : officielles.length
      ? officielles
      : (cours as { competences?: string[] })?.competences?.length
      ? (cours as { competences?: string[] }).competences!
      : cours?.modules.filter((m) => m.type !== "Quiz").map((m) => m.titre) ?? [],
  };
}

// ── Statistiques ──────────────────────────────────────────────────────────────

export async function getStats() {
  const sb = getSupabase();
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const [
    { count: total },
    { count: actifs },
    { count: nouveaux },
    { data: paiements },
    { count: diagnostics },
    { count: messagesNonLus },
  ] = await Promise.all([
    sb.from("adherents").select("id", { count: "exact", head: true }),
    sb.from("adherents").select("id", { count: "exact", head: true }).eq("statut", "Actif"),
    sb.from("adherents").select("id", { count: "exact", head: true }).gte("date_adhesion", monthStart),
    sb.from("paiements").select("montant, date"),
    sb.from("diagnostic_soumissions").select("id", { count: "exact", head: true }),
    sb.from("conversations").select("id", { count: "exact", head: true }).gt("non_lu", 0),
  ]);

  const caMois = (paiements ?? [])
    .filter((p) => p.date >= monthStart)
    .reduce((s, p) => s + Number(p.montant), 0);

  const { count: inscriptionsCours } = await sb
    .from("progressions")
    .select("adherent_email", { count: "exact", head: true });

  const totalNum = total ?? 0;
  const actifsNum = actifs ?? 0;
  const tauxRenouvellement = totalNum > 0 ? Math.round((actifsNum / totalNum) * 100) : 0;

  const progressionMensuelle = await getAdhesionProgressionMensuelle();

  return {
    totalAdherents: totalNum,
    adherentsActifs: actifsNum,
    nouveauxCeMois: nouveaux ?? 0,
    tauxRenouvellement,
    caMois,
    diagnosticsRecus: diagnostics ?? 0,
    messagesNonLus: messagesNonLus ?? 0,
    inscriptionsCours: inscriptionsCours ?? 0,
    progressionMensuelle,
  };
}

async function getAdhesionProgressionMensuelle(): Promise<{ mois: string; valeur: number }[]> {
  const { data } = await getSupabase().from("adherents").select("date_adhesion");
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const d = new Date(row.date_adhesion);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  const sorted = Object.keys(counts).sort().slice(-6);
  const labels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  return sorted.map((k) => {
    const m = parseInt(k.split("-")[1], 10) - 1;
    return { mois: labels[m] ?? k, valeur: counts[k] };
  });
}

export async function searchAdherents(query: string): Promise<AdherentComplet[]> {
  const q = query.trim().toLowerCase();
  if (!q) return getAdherents();
  const all = await getAdherents();
  return all.filter(
    (a) =>
      a.email.toLowerCase().includes(q) ||
      a.prenom.toLowerCase().includes(q) ||
      a.nom.toLowerCase().includes(q) ||
      a.numeroAdherent.toLowerCase().includes(q) ||
      `${a.prenom} ${a.nom}`.toLowerCase().includes(q)
  );
}

export async function updateModule(
  moduleId: string,
  data: Partial<{
    fichier_url: string | null;
    video_url: string | null;
    contenu_md: string | null;
    titre: string;
    duree: string;
    type: string;
  }>
) {
  const { data: row, error } = await getSupabase()
    .from("modules")
    .update(data)
    .eq("id", moduleId)
    .select()
    .single();
  if (error) {
    console.error("[updateModule]", error.message);
    return null;
  }
  return row;
}

export async function createModule(coursId: string, data: { titre: string; duree?: string; type?: string }) {
  const { count } = await getSupabase()
    .from("modules")
    .select("id", { count: "exact", head: true })
    .eq("cours_id", coursId);
  const row = {
    id: `MOD-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    cours_id: coursId,
    titre: data.titre,
    duree: data.duree ?? "",
    type: data.type ?? "Vidéo",
    ordre: (count ?? 0) + 1,
    fichier_url: null,
    video_url: null,
    contenu_md: null,
  };
  await getSupabase().from("modules").insert(row);
  return row;
}

// ── Cours ─────────────────────────────────────────────────────────────────────

export async function getCours() {
  const { data: coursRows } = await getSupabase().from("cours").select("*").order("date", { ascending: false });
  const { data: moduleRows } = await getSupabase().from("modules").select("*");
  return (coursRows ?? []).map(c => toCours(c, moduleRows ?? []));
}

export async function getCoursById(id: string) {
  const { data: row } = await getSupabase().from("cours").select("*").eq("id", id).maybeSingle();
  if (!row) return null;
  const { data: moduleRows } = await getSupabase().from("modules").select("*").eq("cours_id", id);
  return toCours(row, moduleRows ?? []);
}

export async function createCours(data: {
  titre: string; description: string; duree: string;
  niveau: "Débutant" | "Intermédiaire" | "Avancé"; statut: "Publié" | "Brouillon";
  competences?: string[];
  certificatIntro?: string;
  certificatCode?: string;
}) {
  const id = `COURS-${Date.now()}`;
  const row = {
    id,
    titre: data.titre,
    description: data.description,
    duree: data.duree,
    niveau: data.niveau,
    statut: data.statut,
    competences: data.competences ?? [],
    certificat_intro: data.certificatIntro ?? null,
    certificat_code: data.certificatCode ?? null,
    date: new Date().toISOString().split("T")[0],
    prix: null,
  };
  await getSupabase().from("cours").insert(row);
  return { id, ...data, date: row.date, modules: [] };
}

export async function updateCours(id: string, data: Partial<{
  titre: string; description: string; duree: string; niveau: string; statut: string;
  competences: string[]; certificatIntro: string; certificatCode: string;
}>) {
  const patch: Record<string, unknown> = {};
  if (data.titre !== undefined) patch.titre = data.titre;
  if (data.description !== undefined) patch.description = data.description;
  if (data.duree !== undefined) patch.duree = data.duree;
  if (data.niveau !== undefined) patch.niveau = data.niveau;
  if (data.statut !== undefined) patch.statut = data.statut;
  if (data.competences !== undefined) patch.competences = data.competences;
  if (data.certificatIntro !== undefined) patch.certificat_intro = data.certificatIntro;
  if (data.certificatCode !== undefined) patch.certificat_code = data.certificatCode;

  const { data: row } = await getSupabase().from("cours").update(patch).eq("id", id).select().single();
  return row ? toCours(row, []) : null;
}

export async function deleteCours(id: string): Promise<boolean> {
  const sb = getSupabase();
  const { data: cours } = await sb
    .from("cours")
    .select("titre, niveau, competences, certificat_intro, certificat_code")
    .eq("id", id)
    .maybeSingle();

  if (cours) {
    const emails = await getAdherentsCoursTermine(id);
    const snapshot: CertificatSnapshot = {
      titre: cours.titre,
      niveau: cours.niveau,
      competences: cours.competences ?? [],
      certificatIntro: cours.certificat_intro ?? "",
      certificatCode: cours.certificat_code ?? "",
    };
    for (const email of emails) {
      await genererCertificat(email, id, snapshot);
    }
  }

  const { error } = await sb.from("cours").delete().eq("id", id);
  return !error;
}

// ── Progressions ──────────────────────────────────────────────────────────────

async function getQuizResultats(email?: string): Promise<{ adherent_email: string; cours_id: string; module_id: string; score: number; passe: boolean }[]> {
  let q = getSupabase().from("quiz_resultats").select("*");
  if (email) q = q.eq("adherent_email", email.toLowerCase());
  const { data } = await q;
  return data ?? [];
}

export async function getProgressions(adherentEmail?: string): Promise<ProgressionComplet[]> {
  let q = getSupabase().from("progressions").select("*");
  if (adherentEmail) q = q.eq("adherent_email", adherentEmail.toLowerCase());
  const { data: rows } = await q;
  const quizRows = await getQuizResultats(adherentEmail);
  return (rows ?? []).map(p => ({
    adherentEmail: p.adherent_email,
    coursId: p.cours_id,
    modulesTermines: p.modules_termines ?? [],
    dateDebut: p.date_debut,
    quizResultats: quizRows
      .filter(q => q.adherent_email === p.adherent_email && q.cours_id === p.cours_id)
      .map(q => ({ moduleId: q.module_id, score: q.score, passe: q.passe })),
  }));
}

export async function marquerModuleTermine(adherentEmail: string, coursId: string, moduleId: string) {
  const email = adherentEmail.toLowerCase();
  const { data: existing } = await getSupabase().from("progressions").select("*").eq("adherent_email", email).eq("cours_id", coursId).maybeSingle();
  const current = existing?.modules_termines ?? [];
  const updated = current.includes(moduleId) ? current : [...current, moduleId];
  await getSupabase().from("progressions").upsert({ adherent_email: email, cours_id: coursId, modules_termines: updated, date_debut: existing?.date_debut ?? new Date().toISOString().split("T")[0] });

  const { data: moduleRows } = await getSupabase().from("modules").select("id").eq("cours_id", coursId);
  const total = moduleRows?.length ?? 1;
  const pourcentage = Math.round((updated.length / total) * 100);

  return { adherentEmail: email, coursId, modulesTermines: updated, dateDebut: existing?.date_debut ?? new Date().toISOString().split("T")[0], quizResultats: [], pourcentage };
}

export async function enregistrerQuizResultat(adherentEmail: string, coursId: string, moduleId: string, score: number, passe: boolean) {
  const { QUIZ_FINAL_MODULE_ID } = await import("./store-admin");
  const email = adherentEmail.toLowerCase();
  await getSupabase().from("quiz_resultats").upsert({ adherent_email: email, cours_id: coursId, module_id: moduleId, score, passe });

  const { data: existing } = await getSupabase().from("progressions").select("*").eq("adherent_email", email).eq("cours_id", coursId).maybeSingle();
  const current = existing?.modules_termines ?? [];

  const { data: moduleRows } = await getSupabase().from("modules").select("id").eq("cours_id", coursId);
  const total = moduleRows?.length ?? 1;
  const pourcentage = Math.round((current.length / total) * 100);
  const allModulesDone = current.length >= total;
  const coursTermine =
    moduleId === QUIZ_FINAL_MODULE_ID &&
    allModulesDone &&
    passe &&
    score >= 80;

  // ▶ Notif admin si la formation est entièrement terminée (quiz final ≥ 80 %)
  if (coursTermine) {
    try {
      const { notifyAdmin } = await import("./store-admin");
      const { data: cours } = await getSupabase()
        .from("cours")
        .select("titre, niveau, competences, certificat_intro, certificat_code")
        .eq("id", coursId)
        .maybeSingle();
      const coursTitre = cours?.titre ?? coursId;
      await genererCertificat(email, coursId, {
        titre: coursTitre,
        niveau: cours?.niveau ?? "Intermédiaire",
        competences: cours?.competences ?? [],
        certificatIntro: cours?.certificat_intro ?? "",
        certificatCode: cours?.certificat_code ?? "",
        quizScore: score,
      });
      await notifyAdmin({
        type: "cours_termine",
        titre: `Formation terminée — ${coursTitre}`,
        message: `${email} a complété la formation « ${coursTitre} » (quiz final validé à ${score} %).`,
        metadata: { adherentEmail: email, coursId, formation: coursTitre },
      });
    } catch (err) {
      console.error("[enregistrerQuizResultat] notify admin failed:", err);
    }
  }

  return { adherentEmail: email, coursId, modulesTermines: current, dateDebut: existing?.date_debut ?? new Date().toISOString().split("T")[0], quizResultats: [], pourcentage, coursTermine };
}

export async function getProgressionPourcentage(adherentEmail: string, coursId: string): Promise<number> {
  const email = adherentEmail.toLowerCase();
  const { data } = await getSupabase().from("progressions").select("modules_termines").eq("adherent_email", email).eq("cours_id", coursId).maybeSingle();
  if (!data) return 0;
  const { data: moduleRows } = await getSupabase().from("modules").select("id").eq("cours_id", coursId);
  const total = moduleRows?.length ?? 1;
  return Math.round(((data.modules_termines?.length ?? 0) / total) * 100);
}

export async function getCoursTermines(adherentEmail: string): Promise<string[]> {
  const { QUIZ_FINAL_MODULE_ID } = await import("./store-admin");
  const email = adherentEmail.toLowerCase();
  const { data: progs } = await getSupabase().from("progressions").select("cours_id, modules_termines").eq("adherent_email", email);
  if (!progs?.length) return [];
  const results: string[] = [];
  for (const p of progs) {
    const { data: moduleRows } = await getSupabase().from("modules").select("id").eq("cours_id", p.cours_id);
    const total = moduleRows?.length ?? 0;
    if (!total) continue;
    const { data: finalQuiz } = await getSupabase()
      .from("quiz_resultats")
      .select("passe, score")
      .eq("adherent_email", email)
      .eq("cours_id", p.cours_id)
      .eq("module_id", QUIZ_FINAL_MODULE_ID)
      .maybeSingle();
    if ((p.modules_termines?.length ?? 0) >= total && finalQuiz?.passe && (finalQuiz.score ?? 0) >= 80) {
      results.push(p.cours_id);
    }
  }
  return results;
}

// ── Paiements ─────────────────────────────────────────────────────────────────

export async function getPaiements(adherentEmail?: string): Promise<Paiement[]> {
  let q = getSupabase().from("paiements").select("*").order("date", { ascending: false });
  if (adherentEmail) q = q.eq("adherent_email", adherentEmail.toLowerCase());
  const { data } = await q;
  return (data ?? []).map(toPaiement);
}

export async function getPaiementParSession(stripeSessionId: string): Promise<Paiement | null> {
  const { data } = await getSupabase().from("paiements").select("*").eq("stripe_session_id", stripeSessionId).maybeSingle();
  return data ? toPaiement(data) : null;
}

export async function enregistrerPaiement(
  data: Omit<Paiement, "id" | "date" | "numerTransaction"> & {
    provider?: string;
    fapshiTransactionId?: string;
    externalId?: string;
  }
): Promise<Paiement> {
  const { count } = await getSupabase().from("paiements").select("id", { count: "exact", head: true });
  const num = String((count ?? 0) + 1).padStart(6, "0");
  const paiement = {
    id: `PAY-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    numer_transaction: `TXN-${new Date().getFullYear()}-${num}`,
    adherent_email: data.adherentEmail.toLowerCase(),
    cours_id: data.coursId,
    cours_titre: data.coursTitre,
    montant: data.montant,
    stripe_session_id: data.stripeSessionId || null,
    provider: data.provider ?? "stripe",
    fapshi_transaction_id: data.fapshiTransactionId ?? null,
    external_id: data.externalId ?? null,
  };
  await getSupabase().from("paiements").insert(paiement);
  return toPaiement(paiement);
}

export async function getPaiementParFapshiId(fapshiId: string): Promise<Paiement | null> {
  const { data } = await getSupabase()
    .from("paiements")
    .select("*")
    .eq("fapshi_transaction_id", fapshiId)
    .maybeSingle();
  return data ? toPaiement(data) : null;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function getNotifications(adherentEmail: string): Promise<Notification[]> {
  const { data } = await getSupabase().from("notifications").select("*").eq("adherent_email", adherentEmail.toLowerCase()).order("date", { ascending: false });
  return (data ?? []).map(toNotification);
}

export async function getNonLuCount(adherentEmail: string): Promise<number> {
  const { count } = await getSupabase().from("notifications").select("id", { count: "exact", head: true }).eq("adherent_email", adherentEmail.toLowerCase()).eq("lue", false);
  return count ?? 0;
}

export async function addNotification(data: Omit<Notification, "id" | "date" | "lue">): Promise<Notification> {
  const notif = {
    id: `NOTIF-${Date.now()}`,
    date: new Date().toISOString(),
    lue: false,
    adherent_email: data.adherentEmail.toLowerCase(),
    type: data.type,
    titre: data.titre,
    message: data.message,
  };
  await getSupabase().from("notifications").insert(notif);
  return toNotification(notif);
}

export async function marquerNotificationsLues(adherentEmail: string): Promise<void> {
  await getSupabase().from("notifications").update({ lue: true }).eq("adherent_email", adherentEmail.toLowerCase());
}

// ── Certificats ───────────────────────────────────────────────────────────────

export function getProgrammeCode(titre: string): string {
  const t = titre.toUpperCase();
  if (t.includes("MINDSET")) return "ME";
  if (t.includes("VENDEUR")) return "VA";
  if (t.includes("LEADERSHIP")) return "LS";
  if (t.includes("STRUCTURATION") || t.includes("BUSINESS DEVELOPMENT")) return "BD";
  if (t.includes("FISCAL") || t.includes("OPTIMISATION")) return "OF";
  if (t.includes("DIAGNOSTIC")) return "DG";
  return "PR";
}

export function getNiveauCode(niveau: string): string {
  if (niveau === "Débutant") return "L1";
  if (niveau === "Intermédiaire") return "L2";
  if (niveau === "Avancé") return "L3";
  return "L1";
}

/** Mention officielle JCBO selon le score global du certifié. */
export function getMentionCertificat(score: number): {
  code: "EXCELLENCE" | "TRES_BIEN" | "BIEN" | "EN_COURS";
  label: string;
} {
  if (score >= 95) return { code: "EXCELLENCE", label: "Excellence JCBO-CONSEIL" };
  if (score >= 90) return { code: "TRES_BIEN", label: "Très Bien JCBO-CONSEIL" };
  if (score >= 80) return { code: "BIEN", label: "Bien JCBO-CONSEIL" };
  return { code: "EN_COURS", label: "Validation en cours" };
}

/** Compétences officielles par programme (cf. systeme-de-certif.txt). */
export function getCompetencesProgramme(code: string): string[] {
  switch (code) {
    case "ME":
      return [
        "Développement du mindset entrepreneurial",
        "Renforcement de la posture professionnelle",
        "Structuration stratégique de l'activité",
        "Prise de décision et pilotage",
        "Leadership et discipline opérationnelle",
        "Vision business et performance",
        "Communication d'impact et crédibilité professionnelle",
      ];
    case "VA":
      return [
        "Posture commerciale",
        "Persuasion & négociation",
        "Communication d'impact",
        "Leadership commercial",
        "Confiance relationnelle",
        "Développement business",
      ];
    case "LS":
      return [
        "Leadership décisionnel",
        "Vision stratégique",
        "Pilotage d'équipe",
        "Management de la performance",
        "Intelligence relationnelle",
        "Posture dirigeant",
        "Conduite du changement",
      ];
    case "BD":
      return [
        "Développement commercial",
        "Stratégie de croissance",
        "Prospection",
        "Négociation B2B",
        "Structuration d'offres",
        "Acquisition clients",
        "Stratégie de partenariats",
      ];
    default:
      return [];
  }
}

export async function getCertificatAdherent(email: string, coursId: string): Promise<CertificatEmis | null> {
  const { data } = await getSupabase().from("certificats_emis").select("*").eq("adherent_email", email.toLowerCase()).eq("cours_id", coursId).maybeSingle();
  if (!data) return null;
  return toCertificatEmis(data);
}

export async function getCertificatsAdherent(email: string): Promise<CertificatEmis[]> {
  const normalized = email.toLowerCase();
  let { data } = await getSupabase()
    .from("certificats_emis")
    .select("*")
    .eq("adherent_email", normalized)
    .order("date_emission", { ascending: false });

  const termines = await getCoursTermines(normalized);
  for (const coursId of termines) {
    if (data?.some((r) => r.cours_id === coursId)) continue;
    const cours = await getCoursById(coursId);
    if (!cours) continue;
    await genererCertificat(normalized, coursId, {
      titre: cours.titre,
      niveau: cours.niveau,
      competences: (cours as { competences?: string[] }).competences ?? [],
      certificatIntro: (cours as { certificatIntro?: string }).certificatIntro ?? "",
      certificatCode: (cours as { certificatCode?: string }).certificatCode ?? "",
    });
  }

  if (termines.some((id) => !data?.some((r) => r.cours_id === id))) {
    const refreshed = await getSupabase()
      .from("certificats_emis")
      .select("*")
      .eq("adherent_email", normalized)
      .order("date_emission", { ascending: false });
    data = refreshed.data;
  }

  return (data ?? []).map(toCertificatEmis);
}

export async function getCertificatByNumero(numero: string): Promise<CertificatEmis | null> {
  const { data } = await getSupabase().from("certificats_emis").select("*").eq("numero", numero).maybeSingle();
  if (!data) return null;
  return toCertificatEmis(data);
}

function toCertificatEmis(row: {
  id: string;
  adherent_email: string;
  cours_id: string;
  numero: string;
  programme_code: string;
  niveau_code: string;
  annee: number;
  date_emission: string;
  cours_titre?: string;
  cours_niveau?: string;
  competences?: string[];
  certificat_intro?: string;
  certificat_code?: string;
  quiz_score?: number | null;
}): CertificatEmis {
  return {
    id: row.id,
    adherentEmail: row.adherent_email,
    coursId: row.cours_id,
    numero: row.numero,
    programmeCode: row.programme_code,
    niveauCode: row.niveau_code,
    annee: row.annee,
    dateEmission: row.date_emission,
    coursTitre: row.cours_titre ?? "",
    coursNiveau: row.cours_niveau ?? "",
    competences: row.competences ?? [],
    certificatIntro: row.certificat_intro ?? "",
    certificatCode: row.certificat_code ?? "",
    quizScore: row.quiz_score ?? null,
  };
}

async function getAdherentsCoursTermine(coursId: string): Promise<string[]> {
  const { QUIZ_FINAL_MODULE_ID } = await import("./store-admin");
  const { data: progs } = await getSupabase().from("progressions").select("adherent_email, modules_termines").eq("cours_id", coursId);
  if (!progs?.length) return [];
  const { data: moduleRows } = await getSupabase().from("modules").select("id").eq("cours_id", coursId);
  const total = moduleRows?.length ?? 0;
  if (!total) return [];
  const emails: string[] = [];
  for (const p of progs) {
    const { data: finalQuiz } = await getSupabase()
      .from("quiz_resultats")
      .select("passe, score")
      .eq("adherent_email", p.adherent_email)
      .eq("cours_id", coursId)
      .eq("module_id", QUIZ_FINAL_MODULE_ID)
      .maybeSingle();
    if ((p.modules_termines?.length ?? 0) >= total && finalQuiz?.passe && (finalQuiz.score ?? 0) >= 80) {
      emails.push(p.adherent_email);
    }
  }
  return emails;
}

export async function genererCertificat(email: string, coursId: string, snapshot: CertificatSnapshot): Promise<CertificatEmis> {
  const existing = await getCertificatAdherent(email, coursId);
  if (existing) {
    if (!existing.coursTitre && snapshot.titre) {
      await getSupabase().from("certificats_emis").update({
        cours_titre: snapshot.titre,
        cours_niveau: snapshot.niveau,
        competences: snapshot.competences ?? [],
        certificat_intro: snapshot.certificatIntro ?? "",
        certificat_code: snapshot.certificatCode ?? "",
        quiz_score: snapshot.quizScore ?? null,
      }).eq("adherent_email", email.toLowerCase()).eq("cours_id", coursId);
      return { ...existing, ...snapshot, coursTitre: snapshot.titre, coursNiveau: snapshot.niveau, competences: snapshot.competences ?? [], certificatIntro: snapshot.certificatIntro ?? "", certificatCode: snapshot.certificatCode ?? "", quizScore: snapshot.quizScore ?? null };
    }
    return existing;
  }

  const coursTitre = snapshot.titre;
  const programmeCode = snapshot.certificatCode || getProgrammeCode(coursTitre);
  const niveauCode = getNiveauCode(snapshot.niveau);
  const annee = new Date().getFullYear();
  const cle = `${programmeCode}-${niveauCode}-${annee}`;

  const { data: counter } = await getSupabase().from("compteurs_certificats").select("valeur").eq("cle", cle).maybeSingle();
  const seq = (counter?.valeur ?? 0) + 1;
  await getSupabase().from("compteurs_certificats").upsert({ cle, valeur: seq });

  const numero = `JCBO-${programmeCode}-${niveauCode}-${annee}-${String(seq).padStart(4, "0")}`;
  const cert = {
    id: `CERT-${Date.now()}`,
    adherent_email: email.toLowerCase(),
    cours_id: coursId,
    numero,
    programme_code: programmeCode,
    niveau_code: niveauCode,
    annee,
    date_emission: new Date().toISOString().split("T")[0],
    cours_titre: snapshot.titre,
    cours_niveau: snapshot.niveau,
    competences: snapshot.competences ?? [],
    certificat_intro: snapshot.certificatIntro ?? "",
    certificat_code: snapshot.certificatCode ?? "",
    quiz_score: snapshot.quizScore ?? null,
  };
  await getSupabase().from("certificats_emis").insert(cert);

  // Notif adhérent
  try {
    await addNotification({
      adherentEmail: email,
      type: "certificat",
      titre: "Certificat disponible",
      message: `Félicitations ! Votre certificat « ${coursTitre} » a été émis. Numéro : ${numero}.`,
    });
  } catch {
    /* silencieux */
  }

  // Notif admin
  try {
    const { notifyAdmin } = await import("./store-admin");
    await notifyAdmin({
      type: "certificat",
      titre: `Certificat émis — ${coursTitre}`,
      message: `Un certificat (${numero}) a été émis pour ${email} sur la formation « ${coursTitre} ».`,
      metadata: { adherentEmail: email, coursId, numero, programmeCode, niveauCode, annee },
    });
  } catch (err) {
    console.error("[genererCertificat] notify admin failed:", err);
  }

  return toCertificatEmis(cert);
}
