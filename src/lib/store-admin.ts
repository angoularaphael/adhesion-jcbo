import { getSupabase } from "./supabase";
import { hashPassword, generatePassword, verifyPassword } from "./password";
import { slugify, uniqueSlug } from "./slug";

/** Identité du super administrateur principal (non listé dans « Administrateurs »). */
export const SUPER_ADMIN_PRENOM = "Angoula";
export const SUPER_ADMIN_NOM = "Raphael";

export type AdminProfil = {
  id?: string;
  email: string;
  prenom: string;
  nom: string;
  telephone: string;
  photoUrl: string;
  role?: "super_admin" | "admin";
};

export type AdminRecord = AdminProfil & {
  id: string;
  role: "super_admin" | "admin";
  statut: "Actif" | "Inactif";
  creeLe: string;
  creePar: string;
};

type AdminRow = {
  id: string;
  email: string;
  mot_de_passe: string;
  prenom: string;
  nom: string;
  telephone: string;
  photo_url: string;
  role: "super_admin" | "admin";
  statut: "Actif" | "Inactif";
  cree_le: string;
  cree_par: string;
};

function mapAdminRow(r: AdminRow): AdminRecord {
  return {
    id: r.id,
    email: r.email,
    prenom: r.prenom,
    nom: r.nom,
    telephone: r.telephone,
    photoUrl: r.photo_url,
    role: r.role,
    statut: r.statut,
    creeLe: r.cree_le,
    creePar: r.cree_par,
  };
}

export async function getConfigValue(cle: string): Promise<string> {
  const { data } = await getSupabase().from("config").select("valeur").eq("cle", cle).maybeSingle();
  return data?.valeur ?? "";
}

export async function setConfigValue(cle: string, valeur: string): Promise<void> {
  await getSupabase().from("config").upsert({ cle, valeur });
}

export function getAdminEmail(): string {
  return (import.meta.env.ADMIN_EMAIL ?? "").toLowerCase().trim()
    || "angoularaphael05@gmail.com";
}

export async function syncAdminPasswordFromEnv(): Promise<void> {
  const plain = import.meta.env.ADMIN_PASSWORD;
  if (!plain) return;
  const hash = await hashPassword(plain);
  await setConfigValue("admin_mot_de_passe", hash);
}

/** Crée le super admin initial depuis config / .env si la table est vide. */
export async function ensureAdminsBootstrapped(): Promise<void> {
  const { count } = await getSupabase()
    .from("admins")
    .select("id", { count: "exact", head: true });

  if ((count ?? 0) > 0) {
    await syncSuperAdminProfile();
    return;
  }

  await syncAdminPasswordFromEnv();
  let hash = await getConfigValue("admin_mot_de_passe");
  if (!hash) {
    const plain = import.meta.env.ADMIN_PASSWORD;
    if (!plain) return;
    hash = await hashPassword(plain);
  }

  const [prenom, nom, telephone, photoUrl] = await Promise.all([
    getConfigValue("admin_prenom"),
    getConfigValue("admin_nom"),
    getConfigValue("admin_telephone"),
    getConfigValue("admin_photo_url"),
  ]);

  const email = getAdminEmail();
  await getSupabase().from("admins").insert({
    id: `ADM-${Date.now()}`,
    email,
    mot_de_passe: hash,
    prenom: prenom || SUPER_ADMIN_PRENOM,
    nom: nom || SUPER_ADMIN_NOM,
    telephone: telephone || "",
    photo_url: photoUrl || "",
    role: "super_admin",
    statut: "Actif",
    cree_par: "system",
  });
}

/** Met à jour nom + rôle super admin (Angoula Raphael, non listé côté « Administrateurs »). */
export async function syncSuperAdminProfile(): Promise<void> {
  const email = getAdminEmail();
  await getSupabase()
    .from("admins")
    .update({
      prenom: SUPER_ADMIN_PRENOM,
      nom: SUPER_ADMIN_NOM,
      role: "super_admin",
    })
    .eq("email", email);

  await setConfigValue("admin_prenom", SUPER_ADMIN_PRENOM);
  await setConfigValue("admin_nom", SUPER_ADMIN_NOM);
}

export async function getAdminByEmail(email: string): Promise<AdminRecord | null> {
  await ensureAdminsBootstrapped();
  if (email.toLowerCase() === getAdminEmail()) {
    await syncSuperAdminProfile();
  }
  const { data } = await getSupabase()
    .from("admins")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return data ? mapAdminRow(data as AdminRow) : null;
}

export async function listAdmins(): Promise<AdminRecord[]> {
  await ensureAdminsBootstrapped();
  const { data } = await getSupabase()
    .from("admins")
    .select("*")
    .order("cree_le", { ascending: true });
  return (data ?? []).map((r) => mapAdminRow(r as AdminRow));
}

/** Admins créés par le super admin (le super admin n’apparaît pas). */
export async function listManagedAdmins(): Promise<AdminRecord[]> {
  await ensureAdminsBootstrapped();
  await syncSuperAdminProfile();
  const superEmail = getAdminEmail();
  const { data } = await getSupabase()
    .from("admins")
    .select("*")
    .eq("role", "admin")
    .neq("email", superEmail)
    .order("cree_le", { ascending: true });
  return (data ?? []).map((r) => mapAdminRow(r as AdminRow));
}

export async function verifyAdminLogin(
  email: string,
  password: string
): Promise<AdminRecord | null> {
  await ensureAdminsBootstrapped();
  const admin = await getAdminByEmail(email);
  if (!admin || admin.statut !== "Actif") return null;

  const { data } = await getSupabase()
    .from("admins")
    .select("mot_de_passe")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (!data || !(await verifyPassword(password, data.mot_de_passe))) return null;
  return admin;
}

export async function createAdminAccount(
  data: { email: string; prenom: string; nom: string; telephone?: string },
  creePar: string
): Promise<{ admin: AdminRecord; motDePasse: string }> {
  const email = data.email.toLowerCase().trim();
  const existing = await getAdminByEmail(email);
  if (existing) {
    throw new Error("Un administrateur avec cet e-mail existe déjà.");
  }

  const adherentCheck = await getSupabase()
    .from("adherents")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (adherentCheck.data) {
    throw new Error("Cet e-mail est déjà utilisé par un adhérent.");
  }

  const motDePasse = generatePassword(12);
  const hash = await hashPassword(motDePasse);
  const id = `ADM-${Date.now()}`;

  await getSupabase().from("admins").insert({
    id,
    email,
    mot_de_passe: hash,
    prenom: data.prenom,
    nom: data.nom,
    telephone: data.telephone ?? "",
    photo_url: "",
    role: "admin",
    statut: "Actif",
    cree_par: creePar,
  });

  const admin = await getAdminByEmail(email);
  if (!admin) throw new Error("Erreur lors de la création du compte.");
  return { admin, motDePasse };
}

export async function setAdminPasswordForEmail(email: string, plain: string): Promise<void> {
  const hash = await hashPassword(plain);
  const { error } = await getSupabase()
    .from("admins")
    .update({ mot_de_passe: hash })
    .eq("email", email.toLowerCase());

  if (error) throw error;

  if (email.toLowerCase() === getAdminEmail()) {
    await setConfigValue("admin_mot_de_passe", hash);
  }
}

export async function resetAdminPassword(id: string): Promise<string> {
  const motDePasse = generatePassword(12);
  await getSupabase()
    .from("admins")
    .update({ mot_de_passe: await hashPassword(motDePasse) })
    .eq("id", id);
  return motDePasse;
}

export async function setAdminStatut(
  id: string,
  statut: "Actif" | "Inactif",
  requesterEmail: string
): Promise<AdminRecord> {
  const target = await getAdminById(id);
  if (!target) throw new Error("Administrateur introuvable.");

  if (target.email === requesterEmail.toLowerCase() && statut === "Inactif") {
    throw new Error("Vous ne pouvez pas désactiver votre propre compte.");
  }

  if (target.role === "super_admin" && statut === "Inactif") {
    const { count } = await getSupabase()
      .from("admins")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin")
      .eq("statut", "Actif");
    if ((count ?? 0) <= 1) {
      throw new Error("Impossible de désactiver le dernier super administrateur.");
    }
  }

  await getSupabase().from("admins").update({ statut }).eq("id", id);
  const updated = await getAdminById(id);
  if (!updated) throw new Error("Erreur de mise à jour.");
  return updated;
}

export async function getAdminById(id: string): Promise<AdminRecord | null> {
  const { data } = await getSupabase().from("admins").select("*").eq("id", id).maybeSingle();
  return data ? mapAdminRow(data as AdminRow) : null;
}

export async function getAdminProfil(email?: string): Promise<AdminProfil> {
  const targetEmail = (email ?? getAdminEmail()).toLowerCase();
  const admin = await getAdminByEmail(targetEmail);
  if (admin) {
    return {
      id: admin.id,
      email: admin.email,
      prenom: admin.prenom,
      nom: admin.nom,
      telephone: admin.telephone,
      photoUrl: admin.photoUrl,
      role: admin.role,
    };
  }

  const [prenom, nom, telephone, photoUrl] = await Promise.all([
    getConfigValue("admin_prenom"),
    getConfigValue("admin_nom"),
    getConfigValue("admin_telephone"),
    getConfigValue("admin_photo_url"),
  ]);
  return {
    email: targetEmail,
    prenom: prenom || SUPER_ADMIN_PRENOM,
    nom: nom || SUPER_ADMIN_NOM,
    telephone,
    photoUrl,
    role: "super_admin",
  };
}

export async function updateAdminProfil(
  email: string,
  data: Partial<AdminProfil>
): Promise<AdminProfil> {
  const admin = await getAdminByEmail(email);
  if (admin) {
    const patch: Record<string, string> = {};
    if (data.prenom !== undefined) patch.prenom = data.prenom;
    if (data.nom !== undefined) patch.nom = data.nom;
    if (data.telephone !== undefined) patch.telephone = data.telephone;
    if (data.photoUrl !== undefined) patch.photo_url = data.photoUrl;
    if (Object.keys(patch).length > 0) {
      await getSupabase().from("admins").update(patch).eq("id", admin.id);
    }
    return getAdminProfil(email);
  }

  if (data.prenom !== undefined) await setConfigValue("admin_prenom", data.prenom);
  if (data.nom !== undefined) await setConfigValue("admin_nom", data.nom);
  if (data.telephone !== undefined) await setConfigValue("admin_telephone", data.telephone);
  if (data.photoUrl !== undefined) await setConfigValue("admin_photo_url", data.photoUrl);
  return getAdminProfil(email);
}

/** @deprecated Utiliser verifyAdminLogin */
export async function verifyAdminPassword(plain: string): Promise<boolean> {
  const admin = await verifyAdminLogin(getAdminEmail(), plain);
  return !!admin;
}

export async function setAdminPassword(email: string, plain: string): Promise<void> {
  await setAdminPasswordForEmail(email, plain);
}

// ── Diagnostic ────────────────────────────────────────────────────────────────

export type DiagnosticAcces = {
  id: string;
  email: string;
  nom: string;
  utilise: boolean;
  expireLe: string;
  creeLe: string;
};

export async function createDiagnosticAcces(email: string, nom = ""): Promise<{ acces: DiagnosticAcces; motDePasse: string }> {
  const password = generatePassword(10);
  const hash = await hashPassword(password);
  const id = `DIAG-${Date.now()}`;
  const expire = new Date();
  expire.setDate(expire.getDate() + 7);
  const row = {
    id,
    email: email.toLowerCase(),
    mot_de_passe: hash,
    nom: nom || email.split("@")[0],
    utilise: false,
    expire_le: expire.toISOString(),
    cree_par: "admin",
  };
  await getSupabase().from("diagnostic_acces").insert(row);
  return {
    acces: {
      id: row.id,
      email: row.email,
      nom: row.nom,
      utilise: false,
      expireLe: row.expire_le,
      creeLe: new Date().toISOString(),
    },
    motDePasse: password,
  };
}

export async function getDiagnosticAccesList(): Promise<DiagnosticAcces[]> {
  const { data } = await getSupabase()
    .from("diagnostic_acces")
    .select("*")
    .order("cree_le", { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    nom: r.nom,
    utilise: r.utilise,
    expireLe: r.expire_le,
    creeLe: r.cree_le,
  }));
}

export async function verifyDiagnosticLogin(email: string, password: string): Promise<DiagnosticAcces | null> {
  const { data } = await getSupabase()
    .from("diagnostic_acces")
    .select("*")
    .eq("email", email.toLowerCase())
    .eq("utilise", false)
    .gt("expire_le", new Date().toISOString())
    .order("cree_le", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const ok = await verifyPassword(password, data.mot_de_passe);
  if (!ok) return null;
  return {
    id: data.id,
    email: data.email,
    nom: data.nom,
    utilise: data.utilise,
    expireLe: data.expire_le,
    creeLe: data.cree_le,
  };
}

export async function revokeDiagnosticAcces(id: string): Promise<void> {
  await getSupabase().from("diagnostic_acces").update({ utilise: true }).eq("id", id);
}

export type DiagnosticSoumission = {
  id: string;
  email: string;
  nom: string;
  donnees: Record<string, unknown>;
  lu: boolean;
  soumisLe: string;
};

export async function createDiagnosticSoumission(
  accesId: string,
  email: string,
  nom: string,
  donnees: Record<string, unknown>
): Promise<DiagnosticSoumission> {
  const id = `DSUB-${Date.now()}`;
  const row = {
    id,
    email: email.toLowerCase(),
    nom,
    donnees,
    lu: false,
    soumis_le: new Date().toISOString(),
  };
  await getSupabase().from("diagnostic_soumissions").insert(row);
  await revokeDiagnosticAcces(accesId);
  return {
    id: row.id,
    email: row.email,
    nom: row.nom,
    donnees: row.donnees as Record<string, unknown>,
    lu: false,
    soumisLe: row.soumis_le,
  };
}

export async function getDiagnosticSoumissions(): Promise<DiagnosticSoumission[]> {
  const { data } = await getSupabase()
    .from("diagnostic_soumissions")
    .select("*")
    .order("soumis_le", { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    nom: r.nom,
    donnees: r.donnees as Record<string, unknown>,
    lu: r.lu,
    soumisLe: r.soumis_le,
  }));
}

export async function markDiagnosticLu(id: string): Promise<void> {
  await getSupabase().from("diagnostic_soumissions").update({ lu: true }).eq("id", id);
}

export async function countDiagnosticsNonLus(): Promise<number> {
  const { count } = await getSupabase()
    .from("diagnostic_soumissions")
    .select("id", { count: "exact", head: true })
    .eq("lu", false);
  return count ?? 0;
}

// ── Notifications admin (paiements vitrine, contacts, etc.) ──────────────────

export type AdminNotification = {
  id: string;
  type: string;
  titre: string;
  message: string;
  metadata: Record<string, unknown>;
  lue: boolean;
  createdAt: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAdminNotif(r: any): AdminNotification {
  return {
    id: r.id,
    type: r.type,
    titre: r.titre,
    message: r.message,
    metadata: (r.metadata ?? {}) as Record<string, unknown>,
    lue: !!r.lue,
    createdAt: r.created_at,
  };
}

export async function getAdminNotifications(limit = 30): Promise<AdminNotification[]> {
  const { data } = await getSupabase()
    .from("admin_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(mapAdminNotif);
}

export async function countAdminNotificationsNonLues(): Promise<number> {
  const { count } = await getSupabase()
    .from("admin_notifications")
    .select("id", { count: "exact", head: true })
    .eq("lue", false);
  return count ?? 0;
}

export async function markAllAdminNotificationsLues(): Promise<void> {
  await getSupabase().from("admin_notifications").update({ lue: true }).eq("lue", false);
}

export async function markAdminNotificationLue(id: string): Promise<void> {
  await getSupabase().from("admin_notifications").update({ lue: true }).eq("id", id);
}

// ── Quiz DB ───────────────────────────────────────────────────────────────────

export type QuizQuestion = {
  id: string;
  moduleId: string;
  question: string;
  options: string[];
  correcte: number;
};

export async function getQuizQuestions(moduleId: string): Promise<QuizQuestion[]> {
  const { data } = await getSupabase()
    .from("quiz_questions")
    .select("*")
    .eq("module_id", moduleId)
    .order("ordre", { ascending: true });
  return (data ?? []).map((r) => ({
    id: r.id,
    moduleId: r.module_id,
    question: r.question,
    options: r.options as string[],
    correcte: r.correcte,
  }));
}

export async function upsertQuizQuestion(q: Omit<QuizQuestion, "id"> & { id?: string }): Promise<void> {
  await getSupabase().from("quiz_questions").upsert({
    id: q.id ?? `QQ-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    module_id: q.moduleId,
    question: q.question,
    options: q.options,
    correcte: q.correcte,
    ordre: 0,
  });
}

// ── Newsletter ────────────────────────────────────────────────────────────────

export async function subscribeNewsletter(email: string): Promise<void> {
  await getSupabase().from("newsletter_abonnes").upsert({ email: email.toLowerCase() });
}

// ── Actualités publiques ──────────────────────────────────────────────────────

export async function getActualitesPubliees() {
  const { data } = await getSupabase()
    .from("actualites")
    .select("*")
    .eq("statut", "Publié")
    .order("date", { ascending: false });
  return data ?? [];
}

export async function getActualiteBySlug(slug: string) {
  const { data } = await getSupabase()
    .from("actualites")
    .select("*")
    .eq("slug", slug)
    .eq("statut", "Publié")
    .maybeSingle();
  return data;
}

export async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  let q = getSupabase().from("actualites").select("id").eq("slug", slug);
  if (excludeId) q = q.neq("id", excludeId);
  const { data } = await q.maybeSingle();
  return !!data;
}

export { slugify, uniqueSlug };
