import { showPageLoader } from "./ui-loading";

export function initDashboardNav(): void {
  document.querySelectorAll<HTMLAnchorElement>("#sidebar nav a[href]").forEach((link) => {
    link.addEventListener("click", () => {
      if (link.href && !link.href.endsWith("#") && link.origin === window.location.origin) {
        showPageLoader();
      }
    });
  });

  window.addEventListener("pageshow", () => {
    document.getElementById("jcbo-page-loader")?.classList.add("hidden");
  });
}
