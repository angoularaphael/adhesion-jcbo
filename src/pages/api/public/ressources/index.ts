import type { APIRoute } from "astro";
import { getRessources } from "../../../../lib/store";
import { handleCorsPreflight, jsonCorsResponse } from "../../../../lib/cors";

export const OPTIONS: APIRoute = async ({ request }) => handleCorsPreflight(request) ?? new Response(null, { status: 204 });

export const GET: APIRoute = async ({ request }) => {
  const preflight = handleCorsPreflight(request);
  if (preflight) return preflight;

  const ressources = await getRessources();
  const publicList = ressources.map((r: Record<string, unknown>) => ({
    id: r.id,
    titre: r.titre,
    categorie: r.categorie,
    date: r.date,
    hasFichier: !!(r.fichier && r.fichier !== "#"),
  }));

  return jsonCorsResponse(request, { ressources: publicList });
};
