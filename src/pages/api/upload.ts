import type { APIRoute } from "astro";
import { uploadFile, type StorageBucket } from "../../lib/storage";

const ALLOWED: Record<StorageBucket, string[]> = {
  actualites: ["image/jpeg", "image/png", "image/webp"],
  profils: ["image/jpeg", "image/png", "image/webp"],
  "cours-fichiers": ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  "videos-formation": ["video/mp4", "video/webm"],
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const bucket = form.get("bucket") as StorageBucket;
  const pathPrefix = String(form.get("path") ?? "upload");

  if (!(file instanceof File) || !bucket || !ALLOWED[bucket]) {
    return new Response(JSON.stringify({ error: "Fichier ou bucket invalide" }), { status: 400 });
  }

  if (!ALLOWED[bucket].includes(file.type)) {
    return new Response(JSON.stringify({ error: "Type de fichier non autorisé" }), { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${pathPrefix}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadFile(bucket, path, buffer, file.type);

  if ("error" in result) {
    return new Response(JSON.stringify({ error: result.error }), { status: 500 });
  }

  return new Response(JSON.stringify({ url: result.url, path }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
