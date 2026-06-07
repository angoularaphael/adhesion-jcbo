import type { APIRoute } from "astro";
import { ressourceSchema } from "../../../lib/validation";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getRessources, createRessource } from "../../../lib/store";
import { notifyAdherentsPublishedContent } from "../../../lib/store-admin";

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.session) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  return new Response(JSON.stringify(await getRessources()), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const { allowed } = checkRateLimit(`ressources:${clientAddress}`, 30, 60 * 60 * 1000);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Trop de requêtes" }), { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const result = ressourceSchema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error.issues[0].message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const item = await createRessource(result.data);
  void notifyAdherentsPublishedContent({
    type: "ressource",
    titre: "Nouvelle ressource",
    message: `Une nouvelle ressource est disponible : « ${item.titre} ».`,
    ctaPath: "/adherent/ressources",
  });
  return new Response(JSON.stringify(item), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
