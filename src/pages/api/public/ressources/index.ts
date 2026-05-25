import type { APIRoute } from "astro";
import { getRessourcesVitrine } from "../../../../lib/store";
import { handleCorsPreflight, jsonCorsResponse } from "../../../../lib/cors";

export const OPTIONS: APIRoute = async ({ request }) => handleCorsPreflight(request) ?? new Response(null, { status: 204 });

export const GET: APIRoute = async ({ request }) => {
  const preflight = handleCorsPreflight(request);
  if (preflight) return preflight;

  const ressources = await getRessourcesVitrine();
  const publicList = ressources.map((r: Record<string, unknown>) => ({
    id: r.id,
    titre: r.titre,
    categorie: r.categorie,
    description: r.description ?? "",
    date: r.date,
    nom_fichier: r.nom_fichier ?? "",
  }));

  return jsonCorsResponse(request, { ressources: publicList });
};
