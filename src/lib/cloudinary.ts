import crypto from "node:crypto";

/**
 * Upload via Cloudinary (signed upload).
 *
 * resource_type=auto → gère images, vidéos, et fichiers "raw" (PDF, DOCX, ZIP…).
 * Aucun "bucket" à créer côté Supabase : Cloudinary stocke tout.
 */

export type CloudinaryFolder = "actualites" | "profils" | "cours-fichiers" | "videos-formation";

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
  resourceType: string;
  bytes: number;
};

export async function uploadToCloudinary(
  file: Buffer | Uint8Array,
  mimeType: string,
  folder: CloudinaryFolder,
  pathPrefix = "upload"
): Promise<{ ok: true; data: UploadResult } | { ok: false; error: string }> {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const publicIdSafe = `${pathPrefix}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`
    .replace(/[^a-zA-Z0-9_-]/g, "");

  const paramsToSign: Record<string, string | number> = {
    folder,
    public_id: publicIdSafe,
    timestamp,
  };
  const signature = signParams(paramsToSign, apiSecret);

  const form = new FormData();
  const blob = new Blob([file as BlobPart], { type: mimeType });
  form.append("file", blob, publicIdSafe);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("public_id", publicIdSafe);
  form.append("signature", signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

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
    return {
      ok: true,
      data: {
        url: json.secure_url,
        publicId: json.public_id ?? publicIdSafe,
        resourceType: json.resource_type ?? "image",
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
