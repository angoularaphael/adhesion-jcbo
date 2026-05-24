import type { APIRoute } from "astro";
import {
  setCoursAdherent,
  getAdherentByEmail,
  enregistrerPaiement,
  addNotification,
} from "../../../lib/store";
import { notifyAdmin } from "../../../lib/store-admin";
import { verifyPayment } from "../../../lib/notchpay";

export const POST: APIRoute = async ({ request }) => {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return new Response("JSON invalide", { status: 400 });
  }

  const event = String(payload.event ?? "");
  if (event !== "payment.complete") {
    return new Response(JSON.stringify({ ignored: true, event }), { status: 200 });
  }

  const txData = (payload.data ?? payload) as Record<string, unknown>;
  const reference = String(txData.reference ?? txData.trxref ?? "");
  if (!reference) return new Response("Référence manquante", { status: 400 });

  // Vérifier le paiement côté NotchPay
  const verified = await verifyPayment(reference);
  if (!verified || verified.status !== "complete") {
    return new Response(JSON.stringify({ error: "Paiement non vérifié" }), { status: 400 });
  }

  // Extraire les métadonnées depuis le payload
  const meta = (txData.metadata ?? txData.custom_fields ?? {}) as Record<string, string>;
  const adherentEmail = meta.adherentEmail ?? "";
  const coursIdsStr = meta.coursIds ?? "";
  const montantEur = Number(meta.montant ?? 0);

  if (!adherentEmail || !coursIdsStr) {
    return new Response(JSON.stringify({ error: "Métadonnées manquantes" }), { status: 400 });
  }

  const coursIds = coursIdsStr.split(",").filter(Boolean);
  const adherent = await getAdherentByEmail(adherentEmail);

  if (adherent) {
    const newCours = coursIds.filter(id => !adherent.coursInscrits.includes(id));
    if (newCours.length > 0) {
      await setCoursAdherent(adherent.id, [...adherent.coursInscrits, ...newCours]);
    }
  }

  const paiement = await enregistrerPaiement({
    adherentEmail,
    coursId: coursIds[0] ?? "",
    coursTitre: meta.coursTitres ?? "Formation JCBO",
    montant: montantEur,
    stripeSessionId: "",
    provider: "notchpay",
    fapshiTransactionId: reference,
    externalId: reference,
  });

  await addNotification({
    adherentEmail,
    type: "paiement",
    titre: "Paiement Mobile Money confirmé",
    message: `Votre paiement de ${montantEur} € pour "${meta.coursTitres ?? "Formation"}" a été validé. Accès activé automatiquement.`,
  });

  await notifyAdmin({
    type: "paiement_adherent",
    titre: `Paiement NotchPay — ${meta.coursTitres ?? "Formation"}`,
    message: `${adherentEmail} a réglé ${montantEur} € via Mobile Money pour « ${meta.coursTitres ?? "Formation"} ». Réf. ${reference}`,
    metadata: {
      adherentEmail,
      formations: meta.coursTitres ?? "",
      montant: `${montantEur} €`,
      reference,
      provider: "notchpay",
    },
  });

  return new Response(JSON.stringify({ recu: true }), { status: 200 });
};
