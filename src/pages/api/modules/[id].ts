import type { APIRoute } from "astro";
import { updateModule } from "../../../lib/store";

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const id = params.id;
  if (!id) return new Response(JSON.stringify({ error: "ID requis" }), { status: 400 });

  let body: { fichier_url?: string; video_url?: string; contenu_md?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const row = await updateModule(id, body);
  return new Response(JSON.stringify(row), {
    headers: { "Content-Type": "application/json" },
  });
};
