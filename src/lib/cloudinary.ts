import crypto from "node:crypto";

/**
 * Upload via Cloudinary (signed upload).
 *
 * resource_type=auto → gère images, vidéos, et fichiers "raw" (PDF, DOCX, ZIP…).
 * Aucun "bucket" à créer côté Supabase : Cloudinary stocke tout.
 */

export type CloudinaryFolder = "actualites" | "profils" | "cours-fichiers" | "videos-formation";

export const CLOUDINARY_MAX_SIZE: Record<CloudinaryFolder, number> = {
  actualites: 15 * 1024 * 1024,
  profils: 10 * 1024 * 1024,
  "cours-fichiers": 25 * 1024 * 1024,
  "videos-formation": 500 * 1024 * 1024,
};

export const CLOUDINARY_MEDIA_FOLDERS: CloudinaryFolder[] = [
  "actualites",
  "profils",
  "videos-formation",
];

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

function getConfig(): CloudinaryConfig {
  const cloudName = import.meta.env.CLOUDINARY_CLOUD_NAME || "dtp1d5yjf";
  const apiKey = import.meta.env.CLOUDINARY_API_KEY || "581418934993757";
  const apiSecret = import.meta.env.CLOUDINARY_API_SECRET || "dhrUY5v1aXvdlGKbwuKZ_fyXQ5g";
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary non configuré. Définissez CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET.");
  }
  return { cloudName, apiKey, apiSecret };
}

function signParams(params: Record<string, string | number>, apiSecret: string): string {
  const ordered = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== "")
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(ordered + apiSecret).digest("hex");
}

export type UploadResult = {
  url: string;
  publicId: string;
  resourceType: "image" | "video" | "raw";
  bytes: number;
};

/** PDF/DOC doivent être en `raw`, pas en `image` (sinon HTTP 401 à l'ouverture). */
export function resolveCloudinaryResourceType(
  mimeType: string,
  fileName?: string
): "image" | "video" | "raw" {
  const mime = mimeType.toLowerCase();
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("image/")) return "image";
  if (
    mime === "application/pdf" ||
    mime.includes("msword") ||
    mime.includes("wordprocessingml") ||
    mime.includes("presentation") ||
    mime.includes("spreadsheet") ||
    mime === "application/zip" ||
    mime === "application/octet-stream"
  ) {
    return "raw";
  }
  const ext = fileName?.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "zip"].includes(ext)) return "raw";
  if (["mp4", "webm", "mov", "mkv"].includes(ext)) return "video";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  return "raw";
}

/** Corrige les anciennes URLs PDF stockées sous /image/upload/ → /raw/upload/ */
export function normalizeCloudinaryDeliveryUrl(url: string): string {
  if (!url.includes("res.cloudinary.com")) return url;
  if (/\/image\/upload\/.*\.(pdf|doc|docx|ppt|pptx|zip)(\?|$)/i.test(url)) {
    return url.replace("/image/upload/", "/raw/upload/");
  }
  return url;
}

/** Paramètres signés pour upload direct navigateur → Cloudinary (sans passer par Vercel). */
export function buildSignedUploadParams(
  folder: CloudinaryFolder,
  pathPrefix = "upload",
  fileName?: string,
  mimeType?: string
): {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  publicId: string;
  signature: string;
  resourceType: "image" | "video" | "raw";
} {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const resourceType = resolveCloudinaryResourceType(mimeType ?? "", fileName);
  const ext = fileName?.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : "";
  const publicIdSafe = `${pathPrefix}-${timestamp}-${Math.random().toString(36).slice(2, 8)}${ext}`.replace(
    /[^a-zA-Z0-9_.-]/g,
    ""
  );

  const paramsToSign: Record<string, string | number> = {
    folder,
    public_id: publicIdSafe,
    timestamp,
  };

  return {
    cloudName,
    apiKey,
    timestamp,
    folder,
    publicId: publicIdSafe,
    signature: signParams(paramsToSign, apiSecret),
    resourceType,
  };
}

export async function uploadToCloudinary(
  file: Buffer | Uint8Array,
  mimeType: string,
  folder: CloudinaryFolder,
  pathPrefix = "upload",
  fileName?: string
): Promise<{ ok: true; data: UploadResult } | { ok: false; error: string }> {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const resourceType = resolveCloudinaryResourceType(mimeType, fileName);
  const ext = fileName?.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : "";
  const publicIdSafe = `${pathPrefix}-${timestamp}-${Math.random().toString(36).slice(2, 8)}${ext}`
    .replace(/[^a-zA-Z0-9_.-]/g, "");

  const paramsToSign: Record<string, string | number> = {
    folder,
    public_id: publicIdSafe,
    timestamp,
  };
  const signature = signParams(paramsToSign, apiSecret);

  const form = new FormData();
  const blob = new Blob([file as BlobPart], { type: mimeType });
  form.append("file", blob, fileName || publicIdSafe);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("public_id", publicIdSafe);
  form.append("signature", signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  try {
    const res = await fetch(endpoint, { method: "POST", body: form });
    const json = (await res.json()) as {
      secure_url?: string;
      public_id?: string;
      resource_type?: string;
      bytes?: number;
      error?: { message?: string };
    };
    if (!res.ok || !json.secure_url) {
      return { ok: false, error: json.error?.message || "Échec de l'upload Cloudinary." };
    }
    const deliveryUrl = normalizeCloudinaryDeliveryUrl(json.secure_url);
    return {
      ok: true,
      data: {
        url: deliveryUrl,
        publicId: json.public_id ?? publicIdSafe,
        resourceType: (json.resource_type as UploadResult["resourceType"]) ?? resourceType,
        bytes: json.bytes ?? 0,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur réseau Cloudinary." };
  }
}

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<boolean> {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = { public_id: publicId, timestamp };
  const signature = signParams(paramsToSign, apiSecret);

  const form = new FormData();
  form.append("public_id", publicId);
  form.append("timestamp", String(timestamp));
  form.append("api_key", apiKey);
  form.append("signature", signature);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
      { method: "POST", body: form }
    );
    const json = (await res.json()) as { result?: string };
    return json.result === "ok" || json.result === "not found";
  } catch {
    return false;
  }
}
