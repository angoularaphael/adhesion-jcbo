import type { APIRoute } from "astro";
import Stripe from "stripe";
import { getCours, getAdherentByEmail } from "../../../lib/store";

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "adherent") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 }); }

  const { coursId } = body as { coursId?: string };
  if (!coursId) {
    return new Response(JSON.stringify({ error: "coursId requis" }), { status: 400 });
  }

  const cours = getCours().find(c => c.id === coursId);
  if (!cours || cours.statut !== "Publié") {
    return new Response(JSON.stringify({ error: "Formation introuvable" }), { status: 404 });
  }

  const adherent = getAdherentByEmail(locals.session.email);
  if (!adherent) {
    return new Response(JSON.stringify({ error: "Adhérent introuvable" }), { status: 404 });
  }

  if (adherent.coursInscrits.includes(coursId)) {
    return new Response(JSON.stringify({ error: "Vous êtes déjà inscrit à cette formation" }), { status: 409 });
  }

  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey.includes("REMPLACER")) {
    return new Response(JSON.stringify({ error: "Paiement non configuré — clés Stripe manquantes" }), { status: 503 });
  }

  const stripe = new Stripe(stripeKey);
  const origin = new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: adherent.email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: cours.titre,
            description: cours.description,
          },
          unit_amount: (cours as typeof cours & { prix: number }).prix * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      adherentEmail: adherent.email,
      coursId: cours.id,
      coursTitre: cours.titre,
      montant: String((cours as typeof cours & { prix: number }).prix),
    },
    success_url: `${origin}/paiement/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/adherent/cours`,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
