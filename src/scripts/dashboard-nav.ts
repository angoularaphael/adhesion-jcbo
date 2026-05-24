import { hidePageLoader, showPageLoader } from "./ui-loading";

export function initDashboardNav(sidebarId = "sidebar"): void {
  hidePageLoader();

  // On n'affiche le loader que si la navigation dépasse 150ms : pas de flash
  // pour les navigations rapides (cache, pages déjà visitées).
  let pendingTimer: ReturnType<typeof setTimeout> | null = null;

  document.querySelectorAll<HTMLAnchorElement>(`#${sidebarId} nav a[href]`).forEach((link) => {
    link.addEventListener("click", () => {
      if (link.href && !link.href.endsWith("#") && link.origin === window.location.origin) {
        if (pendingTimer) clearTimeout(pendingTimer);
        pendingTimer = setTimeout(() => showPageLoader(), 150);
      }
    });
  });

  const cancelPending = () => {
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      pendingTimer = null;
    }
    hidePageLoader();
  };

  window.addEventListener("pageshow", cancelPending);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") cancelPending();
  });
}
