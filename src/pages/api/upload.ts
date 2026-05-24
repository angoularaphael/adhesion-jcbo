import type { APIRoute } from "astro";
import { uploadToCloudinary, type CloudinaryFolder } from "../../lib/cloudinary";

const ALLOWED_FOLDERS: CloudinaryFolder[] = [
  "actualites",
  "profils",
  "cours-fichiers",
  "videos-formation",
];

const ALLOWED_MIME: Record<CloudinaryFolder, string[]> = {
  actualites: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  profils: ["image/jpeg", "image/png", "image/webp"],
  "cours-fichiers": [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "image/jpeg",
    "image/png",
  ],
  "videos-formation": [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-matroska",
  ],
};

const MAX_SIZE: Record<CloudinaryFolder, number> = {
  actualites: 8 * 1024 * 1024,
  profils: 4 * 1024 * 1024,
  "cours-fichiers": 25 * 1024 * 1024,
  "videos-formation": 100 * 1024 * 1024,
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: "Requête invalide." }), { status: 400 });
  }

  const file = form.get("file");
  const bucket = String(form.get("bucket") ?? "") as CloudinaryFolder;
  const pathPrefix = String(form.get("path") ?? "upload");

  if (!(file instanceof File) || !ALLOWED_FOLDERS.includes(bucket)) {
    return new Response(JSON.stringify({ error: "Fichier ou dossier invalide." }), { status: 400 });
  }

  if (!ALLOWED_MIME[bucket].includes(file.type)) {
    return new Response(
      JSON.stringify({
        error: `Type de fichier non autorisé pour ${bucket} (reçu : ${file.type || "inconnu"}).`,
      }),
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE[bucket]) {
    const mb = Math.round(MAX_SIZE[bucket] / (1024 * 1024));
    return new Response(
      JSON.stringify({ error: `Fichier trop volumineux. Taille max : ${mb} Mo.` }),
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadToCloudinary(buffer, file.type, bucket, pathPrefix);

  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.error }), { status: 500 });
  }

  return new Response(
    JSON.stringify({
      url: result.data.url,
      publicId: result.data.publicId,
      resourceType: result.data.resourceType,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
