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

type AdminBucket = "cours-fichiers" | "videos-formation" | "ressources-vitrine";
type SmallBucket = "actualites" | "profils";

/**
 * Upload via Vercel pour les petits fichiers (images de profil, actualités).
 */
async function uploadSmallFile(file: File, bucket: SmallBucket, pathPrefix: string): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("bucket", bucket);
  fd.append("path", pathPrefix);
  const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "same-origin" });
  const data = await parseJsonResponse<{ url?: string; error?: string }>(res);
  if (!res.ok || !data.url) throw new Error(data.error || "Échec de l'upload");
  return { url: data.url };
}

/**
 * Upload direct vers Supabase Storage (contourne la limite 4,5 Mo de Vercel).
 */
async function uploadLargeFile(file: File, bucket: AdminBucket): Promise<{ url: string }> {
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
    token?: string;
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
    throw new Error(`Échec de l'upload (${putRes.status}). Vérifiez la taille du fichier.`);
  }
  return { url: signed.ref };
}

export async function uploadFile(
  file: File,
  bucket: SmallBucket | AdminBucket,
  pathPrefix: string
): Promise<{ url: string }> {
  if (bucket === "actualites" || bucket === "profils") {
    return uploadSmallFile(file, bucket, pathPrefix);
  }
  return uploadLargeFile(file, bucket);
}
