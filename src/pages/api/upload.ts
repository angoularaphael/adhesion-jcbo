import type { APIRoute } from "astro";
import { uploadToCloudinary, type CloudinaryFolder } from "../../lib/cloudinary";
import { SUPABASE_FILE_PREFIX } from "../../lib/module-fichier";
import { uploadFile as uploadToSupabaseStorage, type StorageBucket } from "../../lib/storage";

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
  if (!locals.session) {
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

  // Un adhérent ne peut envoyer que sa propre photo de profil ("profils").
  if (locals.session.role === "adherent" && bucket !== "profils") {
    return new Response(JSON.stringify({ error: "Action réservée aux administrateurs." }), { status: 403 });
  }

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

  // PDF / documents de cours → Supabase Storage (privé), pas Cloudinary (401 sur les PDF)
  if (bucket === "cours-fichiers") {
    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
    const safeName = `${pathPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`.replace(
      /[^a-zA-Z0-9_.-]/g,
      "_"
    );
    const storageBucket: StorageBucket = "cours-fichiers";
    const result = await uploadToSupabaseStorage(storageBucket, safeName, buffer, file.type);
    if ("error" in result) {
      return new Response(JSON.stringify({ error: result.error }), { status: 500 });
    }
    const storageRef = `${SUPABASE_FILE_PREFIX}${storageBucket}/${safeName}`;
    return new Response(
      JSON.stringify({ url: storageRef, storage: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const result = await uploadToCloudinary(buffer, file.type, bucket, pathPrefix, file.name);

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
