import type { APIRoute } from "astro";
import { coursSchema } from "../../../lib/validation";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getCours, createCours } from "../../../lib/store";
import { notifyAdherentsPublishedContent } from "../../../lib/store-admin";

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.session) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  const cours = await getCours();
  const data = locals.session.role === "admin"
    ? cours
    : cours.filter(c => c.statut === "Publié");
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const { allowed } = checkRateLimit(`cours:${clientAddress}`, 30, 60 * 60 * 1000);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Trop de requêtes" }), { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const result = coursSchema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error.issues[0].message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const item = await createCours(result.data);
  if (item.statut === "Publié") {
    void notifyAdherentsPublishedContent({
      type: "cours",
      titre: "Nouveau cours",
      message: `Un nouveau cours est disponible : « ${item.titre} ».`,
      ctaPath: "/adherent/cours",
    });
  }
  return new Response(JSON.stringify(item), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
