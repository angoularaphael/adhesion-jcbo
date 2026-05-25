import type { APIRoute } from "astro";
import {
  buildSignedUploadParams,
  CLOUDINARY_MAX_SIZE,
  CLOUDINARY_MEDIA_FOLDERS,
  resolveCloudinaryResourceType,
  type CloudinaryFolder,
} from "../../../lib/cloudinary";

const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_MIME = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];

/**
 * Retourne une signature Cloudinary pour upload direct depuis le navigateur.
 * Vidéos et photos ne transitent pas par Vercel / Supabase Storage.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  let body: { folder?: string; filename?: string; size?: number; contentType?: string; pathPrefix?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const folder = body.folder as CloudinaryFolder;
  if (!CLOUDINARY_MEDIA_FOLDERS.includes(folder)) {
    return new Response(JSON.stringify({ error: "Dossier Cloudinary non autorisé." }), { status: 400 });
  }

  if (locals.session.role === "adherent" && folder !== "profils") {
    return new Response(JSON.stringify({ error: "Action réservée aux administrateurs." }), { status: 403 });
  }

  const size = Number(body.size ?? 0);
  const maxSize = CLOUDINARY_MAX_SIZE[folder];
  if (size > maxSize) {
    const mb = Math.round(maxSize / (1024 * 1024));
    return new Response(JSON.stringify({ error: `Fichier trop volumineux (max ${mb} Mo).` }), { status: 400 });
  }

  const contentType = String(body.contentType ?? "");
  const filename = String(body.filename ?? "fichier");
  const resourceType = resolveCloudinaryResourceType(contentType, filename);

  if (folder === "videos-formation" && resourceType !== "video") {
    return new Response(JSON.stringify({ error: "Seules les vidéos (MP4, WebM…) sont acceptées." }), { status: 400 });
  }
  if ((folder === "actualites" || folder === "profils") && resourceType !== "image") {
    return new Response(JSON.stringify({ error: "Seules les images (JPG, PNG, WebP) sont acceptées." }), { status: 400 });
  }

  const allowed =
    resourceType === "video" ? VIDEO_MIME : resourceType === "image" ? IMAGE_MIME : [];
  if (contentType && allowed.length > 0 && !allowed.includes(contentType)) {
    return new Response(JSON.stringify({ error: `Type non autorisé : ${contentType}` }), { status: 400 });
  }

  const pathPrefix = String(body.pathPrefix ?? "upload");
  const signed = buildSignedUploadParams(folder, pathPrefix, filename, contentType);

  return new Response(
    JSON.stringify({
      cloudName: signed.cloudName,
      apiKey: signed.apiKey,
      timestamp: signed.timestamp,
      folder: signed.folder,
      publicId: signed.publicId,
      signature: signed.signature,
      resourceType: signed.resourceType,
      uploadUrl: `https://api.cloudinary.com/v1_1/${signed.cloudName}/${signed.resourceType}/upload`,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};

/** Vérifie qu'une URL Cloudinary est bien dans un dossier autorisé (optionnel, pour debug). */
export const GET: APIRoute = async ({ locals }) => {
  if (!locals.session) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  return new Response(
    JSON.stringify({
      provider: "cloudinary",
      folders: CLOUDINARY_MEDIA_FOLDERS,
      note: "Vidéos et photos sont stockées sur Cloudinary. Les PDF restent sur Supabase Storage.",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
