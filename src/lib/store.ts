import {
  mockActualites,
  mockConversations,
  mockIdentifiants,
  mockAdherent,
  mockRessources,
} from "../data/mock";

// Store in-memory — remplacé par Supabase dans la prochaine phase
let actualites = mockActualites.map(a => ({ ...a }));
let conversations = mockConversations.map(c => ({
  ...c,
  messages: c.messages.map(m => ({ ...m })),
}));
let identifiants = mockIdentifiants.map(i => ({ ...i }));
let ressources = mockRessources.map(r => ({ ...r }));
let profil = { ...mockAdherent };

// --- Actualités ---
export function getActualites() {
  return actualites;
}

export function createActualite(data: { titre: string; contenu: string; statut: "Publié" | "Brouillon" }) {
  const item = {
    id: `ACT-${Date.now()}`,
    ...data,
    date: new Date().toISOString().split("T")[0],
  };
  actualites.unshift(item);
  return item;
}

export function updateActualite(id: string, data: { titre?: string; contenu?: string; statut?: string }) {
  const index = actualites.findIndex(a => a.id === id);
  if (index === -1) return null;
  actualites[index] = { ...actualites[index], ...data };
  return actualites[index];
}

export function deleteActualite(id: string): boolean {
  const index = actualites.findIndex(a => a.id === id);
  if (index === -1) return false;
  actualites.splice(index, 1);
  return true;
}

// --- Identifiants ---
export function getIdentifiants() {
  return identifiants;
}

export function createIdentifiant(data: { nom: string; email: string }) {
  const charset = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  const item = {
    id: `ID-${String(identifiants.length + 1).padStart(3, "0")}`,
    nom: data.nom,
    email: data.email,
    cree_le: new Date().toISOString().split("T")[0],
    statut: "Actif" as const,
    motDePasse: password,
  };
  identifiants.push(item);
  return item;
}

export function toggleIdentifiantStatut(id: string) {
  const item = identifiants.find(i => i.id === id);
  if (!item) return null;
  item.statut = item.statut === "Actif" ? "Inactif" : "Actif";
  return item;
}

// --- Messagerie ---
export function getConversations() {
  return conversations;
}

export function getConversation(id: string) {
  return conversations.find(c => c.id === id) || null;
}

export function addMessage(conversationId: string, texte: string, de: "admin" | "adherent") {
  const conv = conversations.find(c => c.id === conversationId);
  if (!conv) return null;
  const now = new Date();
  const heure = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
  const msg = { de, texte, heure };
  conv.messages.push(msg);
  conv.dernier_message = texte;
  conv.date = now.toISOString().split("T")[0];
  if (de === "adherent") conv.non_lu++;
  return msg;
}

export function markAsRead(conversationId: string) {
  const conv = conversations.find(c => c.id === conversationId);
  if (conv) conv.non_lu = 0;
}

// --- Profil adhérent ---
export function getProfil() {
  return profil;
}

export function updateProfil(data: { telephone?: string; entreprise?: string; secteur?: string }) {
  profil = { ...profil, ...data };
  return profil;
}

// --- Ressources ---
export function getRessources() {
  return ressources;
}
