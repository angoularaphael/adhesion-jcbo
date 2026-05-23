import type { APIRoute } from "astro";
import {
  setCoursAdherent,
  getAdherentByEmail,
  enregistrerPaiement,
  addNotification,
  setAbonnement,
  getPaiementParFapshiId,
} from "../../../lib/store";

export const POST: APIRoute = async ({ request }) => {
  const secret = import.meta.env.FAPSHI_WEBHOOK_SECRET;
  if (secret) {
    const sig = request.headers.get("x-fapshi-signature") ?? request.headers.get("authorization");
    if (sig !== secret) {
      return new Response("Non autorisé", { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return new Response("JSON invalide", { status: 400 });
  }

  const status = String(payload.status ?? payload.paymentStatus ?? "").toUpperCase();
  if (status !== "SUCCESSFUL" && status !== "SUCCESS") {
    return new Response(JSON.stringify({ ignored: true }), { status: 200 });
  }

  const transId = String(payload.transId ?? payload.transactionId ?? payload.id ?? "");
  if (!transId) return new Response("ID transaction manquant", { status: 400 });

  if (await getPaiementParFapshiId(transId)) {
    return new Response(JSON.stringify({ duplicate: true }), { status: 200 });
  }

  const meta = (payload.meta ?? payload.metadata ?? {}) as Record<string, string>;
  const externalId = String(payload.externalId ?? "");
  const adherentEmail = meta.adherentEmail ?? "";
  const montant = Number(meta.montant ?? payload.amount ?? 0) / 655;

  if (meta.type === "abonnement" && meta.planNom && adherentEmail) {
    const adherent = await getAdherentByEmail(adherentEmail);
    if (adherent) await setAbonnement(adherent.id, meta.planNom);
    await enregistrerPaiement({
      adherentEmail,
      coursId: "",
      coursTitre: `Abonnement ${meta.planNom}`,
      montant,
      stripeSessionId: "",
      provider: "fapshi",
      fapshiTransactionId: transId,
      externalId,
    });
    await addNotification({
      adherentEmail,
      type: "abonnement",
      titre: "Abonnement activé (OM/MoMo)",
      message: `Votre abonnement ${meta.planNom} est actif.`,
    });
  } else if (meta.coursId && adherentEmail) {
    const adherent = await getAdherentByEmail(adherentEmail);
    if (adherent && !adherent.coursInscrits.includes(meta.coursId)) {
      await setCoursAdherent(adherent.id, [...adherent.coursInscrits, meta.coursId]);
    }
    const paiement = await enregistrerPaiement({
      adherentEmail,
      coursId: meta.coursId,
      coursTitre: meta.coursTitre ?? "",
      montant,
      stripeSessionId: "",
      provider: "fapshi",
      fapshiTransactionId: transId,
      externalId,
    });
    await addNotification({
      adherentEmail,
      type: "paiement",
      titre: "Paiement OM/MoMo confirmé",
      message: `Paiement de ${paiement.montant} € validé pour "${paiement.coursTitre}".`,
    });
  }

  return new Response(JSON.stringify({ recu: true }), { status: 200 });
};
