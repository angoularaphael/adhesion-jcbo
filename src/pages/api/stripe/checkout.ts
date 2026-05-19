import type { APIRoute } from "astro";
import Stripe from "stripe";
import { getCours, getAdherentByEmail } from "../../../lib/store";

const PLANS_ABONNEMENT: Record<string, { montant: number; description: string }> = {
  "Standard": { montant: 49, description: "Accès complet aux cours, ressources illimitées, messagerie prioritaire, certificats" },
  "Premium": { montant: 99, description: "Tout le Standard + coaching individuel, accès anticipé et réseau exclusif" },
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "adherent") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 }); }

  const { coursId, planNom } = body as { coursId?: string; planNom?: string };

  if (!coursId && !planNom) {
    return new Response(JSON.stringify({ error: "coursId ou planNom requis" }), { status: 400 });
  }

  const adherent = await getAdherentByEmail(locals.session.email);
  if (!adherent) {
    return new Response(JSON.stringify({ error: "Adhérent introuvable" }), { status: 404 });
  }

  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey.includes("REMPLACER")) {
    return new Response(JSON.stringify({ error: "Paiement non configuré — clés Stripe manquantes" }), { status: 503 });
  }

  const stripe = new Stripe(stripeKey);
  const origin = new URL(request.url).origin;

  if (planNom) {
    const planInfo = PLANS_ABONNEMENT[planNom];
    if (!planInfo) {
      return new Response(JSON.stringify({ error: "Plan invalide" }), { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: adherent.email,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: `Abonnement JCBO-CONSEIL — Plan ${planNom}`, description: planInfo.description },
          unit_amount: planInfo.montant * 100,
          recurring: { interval: "month" },
        },
        quantity: 1,
      }],
      metadata: { adherentEmail: adherent.email, type: "abonnement", planNom, montant: String(planInfo.montant) },
      success_url: `${origin}/adherent/abonnement?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/adherent/abonnement`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const allCours = await getCours();
  const cours = allCours.find(c => c.id === coursId);
  if (!cours || cours.statut !== "Publié") {
    return new Response(JSON.stringify({ error: "Formation introuvable" }), { status: 404 });
  }

  if (adherent.coursInscrits.includes(coursId!)) {
    return new Response(JSON.stringify({ error: "Vous êtes déjà inscrit à cette formation" }), { status: 409 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: adherent.email,
    line_items: [{
      price_data: {
        currency: "eur",
        product_data: { name: cours.titre, description: cours.description },
        unit_amount: (cours.prix ?? 0) * 100,
      },
      quantity: 1,
    }],
    metadata: {
      adherentEmail: adherent.email,
      coursId: cours.id,
      coursTitre: cours.titre,
      montant: String(cours.prix ?? 0),
    },
    success_url: `${origin}/paiement/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/adherent/cours`,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
