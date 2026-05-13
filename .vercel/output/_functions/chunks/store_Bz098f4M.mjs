import { m as mockAdherent, b as mockActualites, c as mockConversations, d as mockIdentifiants, e as mockRessources, f as mockAdhesion, g as mockCertificat, h as mockStats } from './mock_DQYpfraV.mjs';

let actualites = mockActualites.map((a) => ({ ...a }));
let conversations = mockConversations.map((c) => ({
  ...c,
  messages: c.messages.map((m) => ({ ...m }))
}));
let identifiants = mockIdentifiants.map((i) => ({ ...i }));
let ressources = mockRessources.map((r) => ({ ...r }));
let profil = { ...mockAdherent };
function getActualites() {
  return actualites;
}
function createActualite(data) {
  const item = {
    id: `ACT-${Date.now()}`,
    ...data,
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  };
  actualites.unshift(item);
  return item;
}
function updateActualite(id, data) {
  const index = actualites.findIndex((a) => a.id === id);
  if (index === -1) return null;
  actualites[index] = { ...actualites[index], ...data };
  return actualites[index];
}
function deleteActualite(id) {
  const index = actualites.findIndex((a) => a.id === id);
  if (index === -1) return false;
  actualites.splice(index, 1);
  return true;
}
function getIdentifiants() {
  return identifiants;
}
function createIdentifiant(data) {
  const charset = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  const item = {
    id: `ID-${String(identifiants.length + 1).padStart(3, "0")}`,
    nom: data.nom,
    email: data.email,
    cree_le: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    statut: "Actif",
    motDePasse: password
  };
  identifiants.push(item);
  return item;
}
function toggleIdentifiantStatut(id) {
  const item = identifiants.find((i) => i.id === id);
  if (!item) return null;
  item.statut = item.statut === "Actif" ? "Inactif" : "Actif";
  return item;
}
function getConversations() {
  return conversations;
}
function addMessage(conversationId, texte, de) {
  const conv = conversations.find((c) => c.id === conversationId);
  if (!conv) return null;
  const now = /* @__PURE__ */ new Date();
  const heure = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
  const msg = { de, texte, heure };
  conv.messages.push(msg);
  conv.dernier_message = texte;
  conv.date = now.toISOString().split("T")[0];
  if (de === "adherent") conv.non_lu++;
  return msg;
}
function markAsRead(conversationId) {
  const conv = conversations.find((c) => c.id === conversationId);
  if (conv) conv.non_lu = 0;
}
function getProfil() {
  return profil;
}
function updateProfil(data) {
  profil = { ...profil, ...data };
  return profil;
}
function getRessources() {
  return ressources;
}
function getAdhesion() {
  return { ...mockAdhesion };
}
function getCertificat() {
  return { ...mockCertificat };
}
function getStats() {
  return {
    ...mockStats,
    totalAdherents: identifiants.length + 44,
    adherentsActifs: identifiants.filter((i) => i.statut === "Actif").length + 40
  };
}
function findOrCreateConversation(email, sujet) {
  const emailLower = email.toLowerCase();
  let conv = conversations.find((c) => c.email === emailLower);
  if (!conv) {
    conv = {
      id: `MSG-${String(conversations.length + 1).padStart(3, "0")}`,
      email: emailLower,
      adherent: emailLower.split("@")[0].replace(/[._]/g, " "),
      entreprise: "",
      sujet,
      dernier_message: "",
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      non_lu: 0,
      messages: []
    };
    conversations.push(conv);
  }
  return conv;
}

export { getCertificat as a, getProfil as b, getRessources as c, getActualites as d, deleteActualite as e, createActualite as f, getAdhesion as g, findOrCreateConversation as h, addMessage as i, getIdentifiants as j, createIdentifiant as k, updateProfil as l, markAsRead as m, getConversations as n, getStats as o, toggleIdentifiantStatut as t, updateActualite as u };
