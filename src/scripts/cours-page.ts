import { setButtonLoading, uploadFile, withButtonLoading } from "./ui-loading";

type ModuleRow = {
  id: string;
  titre: string;
  duree: string;
  type: string;
  fichierUrl?: string;
  videoUrl?: string;
};

export function initCoursPage(): void {
  const modal = document.getElementById("modal-cours");
  const modalDelete = document.getElementById("modal-delete-cours");
  const form = document.getElementById("form-cours") as HTMLFormElement | null;
  const modalModules = document.getElementById("modal-modules");
  const modulesList = document.getElementById("modules-list");
  let deletingId: string | null = null;
  let currentCoursId: string | null = null;

  function openModal(mode: "create" | "edit", data?: Record<string, string>) {
    const titre = document.getElementById("modal-cours-titre");
    if (titre) titre.textContent = mode === "create" ? "Nouveau cours" : "Modifier le cours";
    (document.getElementById("cours-id") as HTMLInputElement).value = data?.id ?? "";
    (document.getElementById("cours-titre") as HTMLInputElement).value = data?.titre ?? "";
    (document.getElementById("cours-description") as HTMLTextAreaElement).value = data?.description ?? "";
    (document.getElementById("cours-duree") as HTMLInputElement).value = data?.duree ?? "";
    (document.getElementById("cours-niveau") as HTMLSelectElement).value = data?.niveau ?? "Débutant";
    (document.getElementById("cours-statut") as HTMLSelectElement).value = data?.statut ?? "Brouillon";
    document.getElementById("cours-erreur")?.classList.add("hidden");
    modal?.classList.remove("hidden");
  }

  function renderModuleItem(mod: ModuleRow): string {
    const fileInfo = mod.fichierUrl
      ? `<a href="${mod.fichierUrl}" target="_blank" class="text-xs text-blue-600 hover:underline">Fichier joint</a>`
      : `<span class="text-xs text-gray-400">Aucun fichier</span>`;
    const videoInfo = mod.videoUrl
      ? `<a href="${mod.videoUrl}" target="_blank" class="text-xs text-blue-600 hover:underline truncate block max-w-xs">${mod.videoUrl}</a>`
      : `<span class="text-xs text-gray-400">Aucune vidéo</span>`;
    return `
      <div class="border border-gray-100 rounded-xl p-4 module-item" data-module-id="${mod.id}">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div>
            <p class="text-sm font-semibold" style="color:#0b1f3a;">${mod.titre}</p>
            <p class="text-xs text-gray-400">${mod.type}${mod.duree ? " · " + mod.duree : ""}</p>
          </div>
        </div>
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <p class="text-xs text-gray-400 mb-1">Fichier cours (PDF, DOC…)</p>
            ${fileInfo}
            <label class="mt-2 inline-flex cursor-pointer">
              <span class="btn-upload-file px-3 py-1.5 rounded-lg text-xs border border-gray-200 hover:bg-gray-50">Uploader fichier</span>
              <input type="file" class="input-module-file hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" />
            </label>
          </div>
          <div>
            <p class="text-xs text-gray-400 mb-1">Vidéo (URL YouTube, Vimeo…)</p>
            ${videoInfo}
            <input type="url" class="input-module-video w-full mt-2 border rounded-lg px-3 py-2 text-xs" placeholder="https://…" value="${mod.videoUrl ?? ""}" />
          </div>
        </div>
        <button type="button" class="btn-save-module mt-3 px-4 py-2 rounded-lg text-xs font-semibold text-white" style="background:#0b1f3a;">Enregistrer le module</button>
      </div>`;
  }

  async function loadModules(coursId: string, coursTitre: string) {
    currentCoursId = coursId;
    const titleEl = document.getElementById("modal-modules-titre");
    if (titleEl) titleEl.textContent = "Contenu — " + coursTitre;
    if (modulesList) modulesList.innerHTML = `<p class="text-sm text-gray-400">Chargement…</p>`;
    modalModules?.classList.remove("hidden");

    const res = await fetch(`/api/cours/${coursId}/modules`, { credentials: "same-origin" });
    const data = (await res.json()) as { modules?: ModuleRow[]; error?: string };
    if (!res.ok || !modulesList) {
      if (modulesList) modulesList.innerHTML = `<p class="text-sm text-red-500">${data.error || "Erreur"}</p>`;
      return;
    }

    const modules = data.modules ?? [];
    if (modules.length === 0) {
      modulesList.innerHTML = `<p class="text-sm text-gray-400 mb-4">Aucun module. Ajoutez-en un ci-dessous.</p>`;
    } else {
      modulesList.innerHTML = modules.map(renderModuleItem).join("");
    }

    bindModuleEvents();
  }

  function bindModuleEvents() {
    modulesList?.querySelectorAll<HTMLInputElement>(".input-module-file").forEach((input) => {
      input.addEventListener("change", async () => {
        const file = input.files?.[0];
        if (!file) return;
        const item = input.closest(".module-item");
        const btn = item?.querySelector<HTMLElement>(".btn-upload-file");
        if (btn) setButtonLoading(btn as HTMLButtonElement, true, "Upload…");
        try {
          const { url } = await uploadFile(file, "cours-fichiers", "module");
          item?.setAttribute("data-pending-file", url);
          const info = item?.querySelector("div:first-child")?.parentElement;
          const fileBlock = item?.querySelector(".grid > div:first-child");
          if (fileBlock) {
            const link = fileBlock.querySelector("a, span");
            if (link) {
              link.outerHTML = `<a href="${url}" target="_blank" class="text-xs text-blue-600 hover:underline">Fichier prêt</a>`;
            }
          }
        } catch (e) {
          alert(e instanceof Error ? e.message : "Erreur upload");
        } finally {
          if (btn) setButtonLoading(btn as HTMLButtonElement, false);
          input.value = "";
        }
      });
    });

    modulesList?.querySelectorAll<HTMLButtonElement>(".btn-save-module").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const item = btn.closest(".module-item");
        const moduleId = item?.getAttribute("data-module-id");
        if (!moduleId) return;
        const videoInput = item?.querySelector<HTMLInputElement>(".input-module-video");
        const body: Record<string, string> = {};
        const pendingFile = item?.getAttribute("data-pending-file");
        if (pendingFile) body.fichier_url = pendingFile;
        if (videoInput?.value.trim()) body.video_url = videoInput.value.trim();

        await withButtonLoading(btn, async () => {
          const res = await fetch(`/api/modules/${moduleId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify(body),
          });
          const data = (await res.json()) as { error?: string };
          if (!res.ok) {
            alert(data.error || "Erreur");
            return;
          }
          item?.removeAttribute("data-pending-file");
          if (currentCoursId) {
            const titre = document.getElementById("modal-modules-titre")?.textContent?.replace("Contenu — ", "") ?? "";
            await loadModules(currentCoursId, titre);
          }
        }, "Enregistrement…");
      });
    });
  }

  document.getElementById("btn-nouveau-cours")?.addEventListener("click", () => openModal("create"));
  document.getElementById("btn-annuler-cours")?.addEventListener("click", () => modal?.classList.add("hidden"));
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  document.querySelectorAll<HTMLButtonElement>(".btn-edit-cours").forEach((btn) => {
    btn.addEventListener("click", () => {
      openModal("edit", {
        id: btn.dataset.id ?? "",
        titre: btn.dataset.titre ?? "",
        description: btn.dataset.description ?? "",
        duree: btn.dataset.duree ?? "",
        niveau: btn.dataset.niveau ?? "Débutant",
        statut: btn.dataset.statut ?? "Brouillon",
      });
    });
  });

  document.querySelectorAll<HTMLButtonElement>(".btn-contenu-cours").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const titre = btn.dataset.titre ?? "";
      if (id) loadModules(id, titre);
    });
  });

  document.getElementById("btn-annuler-modules")?.addEventListener("click", () => modalModules?.classList.add("hidden"));
  modalModules?.addEventListener("click", (e) => {
    if (e.target === modalModules) modalModules.classList.add("hidden");
  });

  document.getElementById("form-add-module")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentCoursId) return;
    const btn = document.getElementById("btn-add-module") as HTMLButtonElement;
    const titre = (document.getElementById("new-module-titre") as HTMLInputElement).value.trim();
    const duree = (document.getElementById("new-module-duree") as HTMLInputElement).value.trim();
    const type = (document.getElementById("new-module-type") as HTMLSelectElement).value;
    await withButtonLoading(btn, async () => {
      const res = await fetch(`/api/cours/${currentCoursId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ titre, duree, type }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        alert(data.error || "Erreur");
        return;
      }
      (document.getElementById("form-add-module") as HTMLFormElement).reset();
      const coursTitre = document.getElementById("modal-modules-titre")?.textContent?.replace("Contenu — ", "") ?? "";
      await loadModules(currentCoursId!, coursTitre);
    }, "Ajout…");
  });

  document.querySelectorAll<HTMLButtonElement>(".btn-delete-cours").forEach((btn) => {
    btn.addEventListener("click", () => {
      deletingId = btn.dataset.id ?? null;
      const nomEl = document.getElementById("delete-cours-nom");
      if (nomEl) nomEl.textContent = btn.dataset.titre ?? "";
      modalDelete?.classList.remove("hidden");
    });
  });

  document.getElementById("btn-annuler-delete-cours")?.addEventListener("click", () => modalDelete?.classList.add("hidden"));
  modalDelete?.addEventListener("click", (e) => {
    if (e.target === modalDelete) modalDelete.classList.add("hidden");
  });

  document.getElementById("btn-confirmer-delete-cours")?.addEventListener("click", async () => {
    if (!deletingId) return;
    const btn = document.getElementById("btn-confirmer-delete-cours") as HTMLButtonElement;
    await withButtonLoading(btn, async () => {
      const res = await fetch("/api/cours/" + deletingId, { method: "DELETE", credentials: "same-origin" });
      if (res.ok) location.reload();
      else {
        modalDelete?.classList.add("hidden");
        alert("Erreur lors de la suppression.");
      }
    }, "Suppression…");
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const id = (document.getElementById("cours-id") as HTMLInputElement).value;
    const body = {
      titre: (document.getElementById("cours-titre") as HTMLInputElement).value.trim(),
      description: (document.getElementById("cours-description") as HTMLTextAreaElement).value.trim(),
      duree: (document.getElementById("cours-duree") as HTMLInputElement).value.trim(),
      niveau: (document.getElementById("cours-niveau") as HTMLSelectElement).value,
      statut: (document.getElementById("cours-statut") as HTMLSelectElement).value,
    };
    await withButtonLoading(submitBtn, async () => {
      const url = id ? "/api/cours/" + id : "/api/cours";
      const res = await fetch(url, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        const errEl = document.getElementById("cours-erreur");
        if (errEl) {
          errEl.textContent = data.error || "Erreur";
          errEl.classList.remove("hidden");
        }
        return;
      }
      location.reload();
    }, "Enregistrement…");
  });
}

document.addEventListener("DOMContentLoaded", initCoursPage);
