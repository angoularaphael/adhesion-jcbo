import type { APIRoute } from "astro";
import { normalizeCloudinaryDeliveryUrl } from "../../../lib/cloudinary";
import { updateModule } from "../../../lib/store";
import { getSupabase } from "../../../lib/supabase";

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

  // Permettre d'effacer un fichier/vidéo en envoyant une chaîne vide
  const patch: Record<string, string | null> = {};
  if (body.fichier_url !== undefined) patch.fichier_url = body.fichier_url || null;
  if (body.video_url !== undefined) patch.video_url = body.video_url || null;
  if (body.contenu_md !== undefined) patch.contenu_md = body.contenu_md || null;

  if (patch.fichier_url) {
    patch.fichier_url = normalizeCloudinaryDeliveryUrl(patch.fichier_url);
  }

  const row = await updateModule(id, patch);
  if (!row) {
    return new Response(
      JSON.stringify({ error: "Impossible d'enregistrer le module. Vérifiez la base de données." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  return new Response(JSON.stringify(row), {
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  const id = params.id;
  if (!id) return new Response(JSON.stringify({ error: "ID requis" }), { status: 400 });

  const { error } = await getSupabase().from("modules").delete().eq("id", id);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
