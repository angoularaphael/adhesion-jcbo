import type { APIRoute } from "astro";
import { z } from "zod";
import { getAdherentByEmail, setAbonnement, cancelAbonnement } from "../../lib/store";

const PLANS_VALIDES = ["Découverte", "Standard", "Premium"] as const;

const subscribeSchema = z.object({
  plan: z.enum(PLANS_VALIDES),
});

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "adherent") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 }); }

  const result = subscribeSchema.safeParse(body);
  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error.issues[0].message }), { status: 400 });
  }

  const adherent = await getAdherentByEmail(locals.session.email);
  if (!adherent) {
    return new Response(JSON.stringify({ error: "Adhérent introuvable" }), { status: 404 });
  }

  const updated = await setAbonnement(adherent.id, result.data.plan);
  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async ({ locals }) => {
  if (!locals.session || locals.session.role !== "adherent") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const adherent = await getAdherentByEmail(locals.session.email);
  if (!adherent) {
    return new Response(JSON.stringify({ error: "Adhérent introuvable" }), { status: 404 });
  }

  const updated = await cancelAbonnement(adherent.id);
  if (!updated) {
    return new Response(JSON.stringify({ error: "Aucun abonnement actif" }), { status: 400 });
  }

  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
