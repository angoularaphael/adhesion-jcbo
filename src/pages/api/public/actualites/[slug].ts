import type { APIRoute } from "astro";
import { getActualiteBySlug } from "../../../../lib/store-admin";
import { handleCorsPreflight, jsonCorsResponse } from "../../../../lib/cors";

export const OPTIONS: APIRoute = async ({ request }) => handleCorsPreflight(request) ?? new Response(null, { status: 204 });

export const GET: APIRoute = async ({ params, request }) => {
  const preflight = handleCorsPreflight(request);
  if (preflight) return preflight;

  const slug = params.slug;
  if (!slug) return jsonCorsResponse(request, { error: "Slug requis" }, 400);

  const a = await getActualiteBySlug(slug);
  if (!a) return jsonCorsResponse(request, { error: "Article introuvable" }, 404);

  return jsonCorsResponse(request, {
    id: a.id,
    title: a.titre,
    category: a.categorie,
    date: a.date,
    content: a.contenu,
    excerpt: a.extrait,
    image: a.image_url,
    slug: a.slug,
  });
};
