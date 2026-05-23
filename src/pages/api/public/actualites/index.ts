import type { APIRoute } from "astro";
import { getActualitesPubliees } from "../../../../lib/store-admin";
import { handleCorsPreflight, jsonCorsResponse } from "../../../../lib/cors";

export const OPTIONS: APIRoute = async ({ request }) => handleCorsPreflight(request) ?? new Response(null, { status: 204 });

export const GET: APIRoute = async ({ request }) => {
  const preflight = handleCorsPreflight(request);
  if (preflight) return preflight;

  const rows = await getActualitesPubliees();
  const articles = rows.map((a) => ({
    id: a.id,
    title: a.titre,
    category: a.categorie ?? "Actualité",
    date: a.date,
    excerpt: a.extrait || a.contenu?.slice(0, 200),
    image: a.image_url || null,
    slug: a.slug,
  }));

  return jsonCorsResponse(request, { articles });
};
