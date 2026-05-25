import { runWhenReady, uploadFile, withButtonLoading } from "./ui-loading";

export function initProfilPage(): void {
  const photoInput = document.getElementById("photo-input") as HTMLInputElement | null;
  photoInput?.addEventListener("change", async () => {
    const file = photoInput.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadFile(file, "profils", "admin");
      await fetch("/api/admin/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ photoUrl: url }),
      });
      location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erreur upload");
    }
  });

  document.getElementById("form-profil")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.querySelector<HTMLButtonElement>("#form-profil button[type='submit']");
    await withButtonLoading(btn, async () => {
      const res = await fetch("/api/admin/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          prenom: (document.getElementById("prenom") as HTMLInputElement).value,
          nom: (document.getElementById("nom") as HTMLInputElement).value,
          telephone: (document.getElementById("telephone") as HTMLInputElement).value,
        }),
      });
      const msg = document.getElementById("msg-profil");
      if (msg) {
        msg.textContent = res.ok ? "Profil mis à jour." : "Erreur.";
        msg.classList.remove("hidden");
      }
    }, "Enregistrement…");
  });

  document.getElementById("form-password")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.querySelector<HTMLButtonElement>("#form-password button[type='submit']");
    const pwd = (document.getElementById("new-password") as HTMLInputElement).value;
    await withButtonLoading(btn, async () => {
      const res = await fetch("/api/admin/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password: pwd }),
      });
      const data = (await res.json()) as { error?: string };
      const msg = document.getElementById("msg-pwd");
      if (msg) {
        msg.textContent = res.ok ? "Mot de passe mis à jour." : data.error || "Erreur.";
        msg.className = `text-xs mt-3 ${res.ok ? "text-green-600" : "text-red-500"}`;
        msg.classList.remove("hidden");
      }
    }, "Mise à jour…");
  });
}

runWhenReady(initProfilPage);
