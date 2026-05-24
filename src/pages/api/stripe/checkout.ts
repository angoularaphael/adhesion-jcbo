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

  const { coursId, coursIds } = body as { coursId?: string; coursIds?: string[] };

  const idsToProcess = coursIds ?? (coursId ? [coursId] : []);
  if (idsToProcess.length === 0) {
    return new Response(JSON.stringify({ error: "coursId ou coursIds requis" }), { status: 400 });
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

  const allCours = await getCours();
  const coursToCheckout = idsToProcess
    .map(id => allCours.find(c => c.id === id && c.statut === "Publié"))
    .filter(Boolean) as (typeof allCours)[number][];

  if (coursToCheckout.length === 0) {
    return new Response(JSON.stringify({ error: "Aucune formation valide trouvée" }), { status: 404 });
  }

  const alreadyEnrolled = coursToCheckout.filter(c => adherent.coursInscrits.includes(c.id));
  if (alreadyEnrolled.length === coursToCheckout.length) {
    return new Response(JSON.stringify({ error: "Vous êtes déjà inscrit à toutes ces formations" }), { status: 409 });
  }

  const finalCours = coursToCheckout.filter(c => !adherent.coursInscrits.includes(c.id));
  const totalMontant = finalCours.reduce((sum, c) => sum + ((c as typeof c & { prix?: number }).prix ?? 0), 0);

  const line_items = finalCours.map(c => ({
    price_data: {
      currency: "eur" as const,
      product_data: { name: c.titre, description: c.description },
      unit_amount: ((c as typeof c & { prix?: number }).prix ?? 0) * 100,
    },
    quantity: 1,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: adherent.email,
    line_items,
    metadata: {
      adherentEmail: adherent.email,
      coursIds: finalCours.map(c => c.id).join(","),
      coursTitres: finalCours.map(c => c.titre).join(" | "),
      montant: String(totalMontant),
      type: "cours_multiple",
    },
    success_url: `${origin}/paiement/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/adherent/marketplace`,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
