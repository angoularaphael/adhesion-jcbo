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

export async function uploadFile(
  file: File,
  bucket: "actualites" | "cours-fichiers" | "videos-formation" | "profils",
  pathPrefix: string
): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("bucket", bucket);
  fd.append("path", pathPrefix);
  const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "same-origin" });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error || "Échec de l'upload");
  return { url: data.url };
}
