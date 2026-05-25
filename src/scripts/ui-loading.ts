/** Exécute fn dès que le DOM est prêt (évite le bug DOMContentLoaded déjà passé). */
export function runWhenReady(fn: () => void): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  } else {
    fn();
  }
}

export function showPageLoader(): void {
  const el = document.getElementById("jcbo-page-loader");
  if (el) {
    el.classList.add("jcbo-page-loader-visible");
    el.setAttribute("aria-busy", "true");
  }
}

export function hidePageLoader(): void {
  const el = document.getElementById("jcbo-page-loader");
  if (el) {
    el.classList.remove("jcbo-page-loader-visible");
    el.setAttribute("aria-busy", "false");
  }
}

export function setButtonLoading(el: HTMLElement | null, loading: boolean, loadingLabel = "Chargement…"): void {
  if (!el) return;
  const btn = el as HTMLButtonElement;
  if (loading) {
    if (!btn.dataset.loadingOrig) {
      btn.dataset.loadingOrig = btn.innerHTML;
    }
    btn.disabled = true;
    btn.innerHTML = `<span class="jcbo-spinner inline-block align-middle mr-1.5"></span>${loadingLabel}`;
    btn.classList.add("jcbo-btn-loading");
  } else {
    btn.disabled = false;
    if (btn.dataset.loadingOrig) {
      btn.innerHTML = btn.dataset.loadingOrig;
      delete btn.dataset.loadingOrig;
    }
    btn.classList.remove("jcbo-btn-loading");
  }
}

export async function withButtonLoading<T>(
  el: HTMLElement | null,
  fn: () => Promise<T>,
  loadingLabel = "Chargement…"
): Promise<T> {
  setButtonLoading(el, true, loadingLabel);
  try {
    return await fn();
  } finally {
    setButtonLoading(el, false);
  }
}

export async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    const snippet = text.slice(0, 120).replace(/\s+/g, " ");
    throw new Error(
      res.status === 413
        ? "Fichier trop volumineux pour le serveur. Réduisez la taille ou contactez le support."
        : `Erreur serveur (${res.status}) : ${snippet || "réponse invalide"}`
    );
  }
}

type SupabaseBucket = "cours-fichiers" | "ressources-vitrine";
type CloudinaryMediaFolder = "actualites" | "profils" | "videos-formation";

/**
 * Upload direct navigateur → Cloudinary (vidéos + photos).
 * Ne consomme pas le stockage Supabase ni la limite 4,5 Mo de Vercel.
 */
async function uploadToCloudinaryDirect(
  file: File,
  folder: CloudinaryMediaFolder,
  pathPrefix: string
): Promise<{ url: string }> {
  const signRes = await fetch("/api/upload/cloudinary-sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      folder,
      filename: file.name,
      size: file.size,
      contentType: file.type || "application/octet-stream",
      pathPrefix,
    }),
  });
  const sign = await parseJsonResponse<{
    cloudName?: string;
    apiKey?: string;
    timestamp?: number;
    folder?: string;
    publicId?: string;
    signature?: string;
    resourceType?: string;
    uploadUrl?: string;
    error?: string;
  }>(signRes);

  if (!signRes.ok || !sign.uploadUrl || !sign.apiKey || !sign.signature) {
    throw new Error(sign.error || "Signature Cloudinary indisponible");
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sign.apiKey);
  fd.append("timestamp", String(sign.timestamp));
  fd.append("folder", sign.folder ?? folder);
  fd.append("public_id", sign.publicId ?? "");
  fd.append("signature", sign.signature);

  const upRes = await fetch(sign.uploadUrl, { method: "POST", body: fd });
  const upText = await upRes.text();
  let up: { secure_url?: string; error?: { message?: string } };
  try {
    up = JSON.parse(upText);
  } catch {
    throw new Error(`Échec upload Cloudinary (${upRes.status})`);
  }
  if (!upRes.ok || !up.secure_url) {
    throw new Error(up.error?.message || "Échec upload Cloudinary");
  }

  return { url: up.secure_url };
}

/**
 * Upload direct vers Supabase Storage (PDF uniquement — documents privés).
 */
async function uploadToSupabaseDirect(file: File, bucket: SupabaseBucket): Promise<{ url: string }> {
  const signedRes = await fetch("/api/upload/signed-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      bucket,
      filename: file.name,
      size: file.size,
      contentType: file.type,
    }),
  });
  const signed = await parseJsonResponse<{
    uploadUrl?: string;
    ref?: string;
    error?: string;
  }>(signedRes);
  if (!signedRes.ok || !signed.uploadUrl || !signed.ref) {
    throw new Error(signed.error || "URL d'upload indisponible");
  }

  const putRes = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!putRes.ok) {
    throw new Error(`Échec upload PDF (${putRes.status})`);
  }
  return { url: signed.ref! };
}

/** Vidéos + photos → Cloudinary. PDF modules / ressources → Supabase Storage. */
export async function uploadFile(
  file: File,
  bucket: CloudinaryMediaFolder | SupabaseBucket,
  pathPrefix: string
): Promise<{ url: string }> {
  if (bucket === "cours-fichiers" || bucket === "ressources-vitrine") {
    return uploadToSupabaseDirect(file, bucket);
  }
  return uploadToCloudinaryDirect(file, bucket, pathPrefix);
}
