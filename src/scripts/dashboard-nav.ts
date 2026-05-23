import { hidePageLoader, showPageLoader } from "./ui-loading";

export function initDashboardNav(): void {
  hidePageLoader();

  document.querySelectorAll<HTMLAnchorElement>("#sidebar nav a[href]").forEach((link) => {
    link.addEventListener("click", () => {
      if (link.href && !link.href.endsWith("#") && link.origin === window.location.origin) {
        showPageLoader();
      }
    });
  });

  window.addEventListener("pageshow", hidePageLoader);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") hidePageLoader();
  });
}
