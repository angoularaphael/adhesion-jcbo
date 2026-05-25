import type { APIRoute } from "astro";
import Stripe from "stripe";
import {
  getAdherentByEmail, enregistrerPaiement,
  addNotification, setAbonnement, fulfillCoursPayment,
} from "../../../lib/store";
import { notifyAdmin } from "../../../lib/store-admin";

export const POST: APIRoute = async ({ request }) => {
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET?.trim();
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;

  if (!webhookSecret || webhookSecret.includes("REMPLACER") || !stripeKey || stripeKey.includes("REMPLACER")) {
    return new Response("Webhook non configuré", { status: 503 });
  }

  const stripe = new Stripe(stripeKey);
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Signature manquante", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return new Response(`Webhook invalide: ${msg}`, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ recu: true, ignored: event.type }), { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const meta = session.metadata ?? {};
  const amountTotal = (session.amount_total ?? 0) / 100;
  const currency = (session.currency ?? "eur").toUpperCase();

  // ─── Cas 1 : paiement depuis le SITE VITRINE (réservation séance) ─────────────
  if (meta.source === "vitrine") {
    const customerEmail = session.customer_email ?? meta.customerEmail ?? "";
    const sessionLabel = meta.sessionLabel ?? "Réservation";

    await notifyAdmin({
      type: "paiement_vitrine",
      titre: `Paiement reçu — ${sessionLabel}`,
      message:
        `${meta.customerName ?? "Un client"} (${customerEmail}) a réglé ${amountTotal} ${currency} ` +
        `pour la prestation « ${sessionLabel} ».`,
      metadata: {
        client: meta.customerName,
        email: customerEmail,
        telephone: meta.customerPhone,
        entreprise: meta.customerCompany,
        prestation: sessionLabel,
        montant: `${amountTotal} ${currency}`,
        dateSouhaitee: meta.desiredDate,
        message: meta.customerMessage,
        stripeSessionId: session.id,
      },
    });

    return new Response(JSON.stringify({ recu: true, source: "vitrine" }), { status: 200 });
  }

  // ─── Cas 2 : abonnement (espace adhérent) ─────────────────────────────────────
  if (meta.type === "abonnement") {
    const { adherentEmail, planNom, montant } = meta;
    if (!adherentEmail || !planNom) {
      return new Response("Métadonnées abonnement manquantes", { status: 400 });
    }

    const adherent = await getAdherentByEmail(adherentEmail);
    if (adherent) {
      await setAbonnement(adherent.id, planNom);
    }

    await enregistrerPaiement({
      adherentEmail,
      coursId: "",
      coursTitre: `Abonnement ${planNom}`,
      montant: Number(montant ?? 0),
      stripeSessionId: session.id,
    });

    await addNotification({
      adherentEmail,
      type: "abonnement",
      titre: "Abonnement activé",
      message: `Votre abonnement Plan ${planNom} (${montant} €/mois) est maintenant actif. Profitez de tous vos avantages JCBO-CONSEIL.`,
    });

    await notifyAdmin({
      type: "abonnement",
      titre: `Nouvel abonnement — Plan ${planNom}`,
      message: `L'adhérent ${adherentEmail} a souscrit au Plan ${planNom} (${montant} €/mois).`,
      metadata: { adherentEmail, planNom, montant: `${montant} €`, stripeSessionId: session.id },
    });

    return new Response(JSON.stringify({ recu: true, type: "abonnement" }), { status: 200 });
  }

  // ─── Cas 3 : inscription à une/plusieurs formation(s) (espace adhérent) ──────
  const { adherentEmail, coursId, coursIds, coursTitre, coursTitres, montant } = meta;

  if (!adherentEmail || (!coursId && !coursIds)) {
    return new Response("Métadonnées manquantes", { status: 400 });
  }

  const idsToEnroll = coursIds ? coursIds.split(",").filter(Boolean) : (coursId ? [coursId] : []);
  const titres = coursTitres ?? coursTitre ?? "Formation JCBO";

  await fulfillCoursPayment({
    adherentEmail,
    coursIds: idsToEnroll,
    coursTitres: titres,
    montant: Number(montant ?? amountTotal),
    provider: "stripe",
    reference: session.id,
    stripeSessionId: session.id,
  });

  return new Response(JSON.stringify({ recu: true }), { status: 200 });
};
