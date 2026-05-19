import type { APIRoute } from "astro";
import Stripe from "stripe";
import {
  setCoursAdherent, getAdherentByEmail, enregistrerPaiement,
  addNotification, setAbonnement,
} from "../../../lib/store";

export const POST: APIRoute = async ({ request }) => {
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};

    if (meta.type === "abonnement") {
      // --- Abonnement ---
      const { adherentEmail, planNom, montant } = meta;
      if (!adherentEmail || !planNom) {
        return new Response("Métadonnées abonnement manquantes", { status: 400 });
      }

      const adherent = getAdherentByEmail(adherentEmail);
      if (adherent) {
        setAbonnement(adherent.id, planNom);
      }

      enregistrerPaiement({
        adherentEmail,
        coursId: "",
        coursTitre: `Abonnement ${planNom}`,
        montant: Number(montant ?? 0),
        stripeSessionId: session.id,
      });

      addNotification({
        adherentEmail,
        type: "abonnement",
        titre: "Abonnement activé",
        message: `Votre abonnement Plan ${planNom} (${montant} €/mois) est maintenant actif. Profitez de tous vos avantages JCBO-CONSEIL.`,
      });

    } else {
      // --- Cours (paiement unique) ---
      const { adherentEmail, coursId, coursTitre, montant } = meta;

      if (!adherentEmail || !coursId) {
        return new Response("Métadonnées manquantes", { status: 400 });
      }

      const adherent = getAdherentByEmail(adherentEmail);
      if (adherent && !adherent.coursInscrits.includes(coursId)) {
        setCoursAdherent(adherent.id, [...adherent.coursInscrits, coursId]);
      }

      const paiement = enregistrerPaiement({
        adherentEmail,
        coursId,
        coursTitre: coursTitre ?? "",
        montant: Number(montant ?? 0),
        stripeSessionId: session.id,
      });

      addNotification({
        adherentEmail,
        type: "paiement",
        titre: "Paiement confirmé",
        message: `Votre paiement de ${paiement.montant} € pour "${paiement.coursTitre}" a été validé. Votre accès est activé. Réf. ${paiement.numerTransaction}`,
      });

      addNotification({
        adherentEmail,
        type: "inscription",
        titre: "Inscription confirmée",
        message: `Vous êtes maintenant inscrit à la formation "${paiement.coursTitre}". Rendez-vous dans "Mes cours" pour commencer.`,
      });
    }
  }

  return new Response(JSON.stringify({ recu: true }), { status: 200 });
};
