import type { APIRoute } from "astro";
import { getSupabase } from "../../../lib/supabase";
import { SUPABASE_FILE_PREFIX } from "../../../lib/module-fichier";
import type { StorageBucket } from "../../../lib/storage";

const ALLOWED: StorageBucket[] = ["cours-fichiers", "ressources-vitrine", "videos-formation"];

const MAX_SIZE: Record<string, number> = {
  "cours-fichiers": 50 * 1024 * 1024,
  "ressources-vitrine": 50 * 1024 * 1024,
  "videos-formation": 500 * 1024 * 1024,
};

/**
 * Génère une URL signée Supabase Storage pour upload direct depuis le navigateur.
 * Évite la limite 4,5 Mo des serverless Vercel.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Réservé aux administrateurs" }), { status: 401 });
  }

  let body: { bucket?: string; filename?: string; size?: number; contentType?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const bucket = body.bucket as StorageBucket;
  if (!ALLOWED.includes(bucket)) {
    return new Response(JSON.stringify({ error: "Bucket non autorisé" }), { status: 400 });
  }

  const size = Number(body.size ?? 0);
  if (size > MAX_SIZE[bucket]) {
    const mb = Math.round(MAX_SIZE[bucket] / (1024 * 1024));
    return new Response(JSON.stringify({ error: `Fichier trop volumineux (max ${mb} Mo).` }), { status: 400 });
  }

  const original = String(body.filename ?? "fichier");
  const ext = original.includes(".") ? original.slice(original.lastIndexOf(".")) : "";
  const safeName = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`.replace(
    /[^a-zA-Z0-9_.-]/g,
    "_"
  );

  const supa = getSupabase();
  const { data, error } = await supa.storage.from(bucket).createSignedUploadUrl(safeName);
  if (error || !data) {
    return new Response(JSON.stringify({ error: error?.message ?? "Échec génération URL" }), { status: 500 });
  }

  const ref = `${SUPABASE_FILE_PREFIX}${bucket}/${safeName}`;
  return new Response(
    JSON.stringify({
      uploadUrl: data.signedUrl,
      token: data.token,
      path: safeName,
      bucket,
      ref,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
