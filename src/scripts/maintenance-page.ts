import { runWhenReady } from "./ui-loading";

type MaintenanceStatus = { adherent: boolean; vitrine: boolean };

function setToggleUI(site: "adherent" | "vitrine", enabled: boolean) {
  const toggle = document.getElementById(`toggle-maintenance-${site}`) as HTMLInputElement | null;
  const badge = document.getElementById(`badge-maintenance-${site}`);
  if (toggle) toggle.checked = enabled;
  if (badge) {
    badge.textContent = enabled ? "Activé" : "Désactivé";
    badge.className = enabled
      ? "text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800"
      : "text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800";
  }
}

async function loadStatus() {
  const res = await fetch("/api/admin/maintenance", { credentials: "same-origin" });
  if (!res.ok) return;
  const data = (await res.json()) as MaintenanceStatus;
  setToggleUI("adherent", data.adherent);
  setToggleUI("vitrine", data.vitrine);
}

async function toggleMaintenance(site: "adherent" | "vitrine", enabled: boolean) {
  const toggle = document.getElementById(`toggle-maintenance-${site}`) as HTMLInputElement | null;
  if (toggle) toggle.disabled = true;

  try {
    const res = await fetch("/api/admin/maintenance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ site, enabled }),
    });
    const data = (await res.json()) as MaintenanceStatus & { error?: string };
    if (!res.ok) {
      alert(data.error ?? "Erreur lors de la mise à jour.");
      await loadStatus();
      return;
    }
    setToggleUI("adherent", data.adherent);
    setToggleUI("vitrine", data.vitrine);
  } finally {
    if (toggle) toggle.disabled = false;
  }
}

export function initMaintenancePage(): void {
  runWhenReady(() => {
    loadStatus();

    (["adherent", "vitrine"] as const).forEach((site) => {
      document.getElementById(`toggle-maintenance-${site}`)?.addEventListener("change", (e) => {
        const enabled = (e.target as HTMLInputElement).checked;
        toggleMaintenance(site, enabled);
      });
    });
  });
}
