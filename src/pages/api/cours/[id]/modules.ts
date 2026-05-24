import type { APIRoute } from "astro";
import { z } from "zod";
import { normalizeCloudinaryDeliveryUrl } from "../../../../lib/cloudinary";
import { createModule } from "../../../../lib/store";
import { getSupabase } from "../../../../lib/supabase";

const schema = z.object({
  titre: z.string().min(2).max(200),
  duree: z.string().max(50).optional(),
  type: z.enum(["Vidéo", "Document", "Quiz"]).optional(),
});

export const GET: APIRoute = async ({ params, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  const coursId = params.id ?? "";
  const { data: row } = await getSupabase().from("cours").select("id").eq("id", coursId).maybeSingle();
  if (!row) {
    return new Response(JSON.stringify({ error: "Cours introuvable" }), { status: 404 });
  }
  // Requête directe sur ce cours uniquement (évite toute confusion entre formations)
  const { data: moduleRows, error } = await getSupabase()
    .from("modules")
    .select("*")
    .eq("cours_id", coursId)
    .order("ordre", { ascending: true });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  const modules = (moduleRows ?? []).map((m) => ({
    id: m.id,
    titre: m.titre,
    duree: m.duree,
    type: m.type,
    fichierUrl: m.fichier_url ? normalizeCloudinaryDeliveryUrl(m.fichier_url) : undefined,
    videoUrl: m.video_url ?? undefined,
  }));
  return new Response(JSON.stringify({ modules }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  const coursId = params.id;
  if (!coursId) {
    return new Response(JSON.stringify({ error: "ID cours manquant" }), { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.issues[0].message }), { status: 400 });
  }

  const module = await createModule(coursId, parsed.data);
  return new Response(JSON.stringify(module), { status: 201, headers: { "Content-Type": "application/json" } });
};
