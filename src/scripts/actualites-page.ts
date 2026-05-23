import { runWhenReady, setButtonLoading, uploadFile, withButtonLoading } from "./ui-loading";

export function initActualitesPage(): void {
  const modalNouvelle = document.getElementById("modal-nouvelle");
  const modalEdit = document.getElementById("modal-edit");
  let newImageUrl: string | null = null;
  let editImageUrl: string | null = null;

  function showModal(el: HTMLElement | null) {
    el?.classList.replace("hidden", "flex");
  }
  function hideModal(el: HTMLElement | null) {
    el?.classList.replace("flex", "hidden");
  }

  function previewImage(containerId: string, url: string | null) {
    const box = document.getElementById(containerId);
    if (!box) return;
    if (!url) {
      box.innerHTML = "";
      box.classList.add("hidden");
      return;
    }
    box.classList.remove("hidden");
    box.innerHTML = `<img src="${url}" alt="Aperçu" class="w-full h-40 object-cover rounded-lg" /><button type="button" class="btn-remove-image mt-2 text-xs text-red-500 hover:underline" data-target="${containerId}">Supprimer l'image</button>`;
    box.querySelector<HTMLButtonElement>(".btn-remove-image")?.addEventListener("click", () => {
      if (containerId === "preview-nouvelle") newImageUrl = null;
      if (containerId === "preview-edit") editImageUrl = null;
      previewImage(containerId, null);
    });
  }

  async function handleImageInput(input: HTMLInputElement, previewId: string, setter: (url: string | null) => void) {
    const file = input.files?.[0];
    if (!file) return;
    const btn = input.closest("label")?.querySelector("span");
    if (btn) setButtonLoading(btn as HTMLButtonElement, true, "Upload…");
    try {
      const { url } = await uploadFile(file, "actualites", "actu");
      setter(url);
      previewImage(previewId, url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erreur upload");
    } finally {
      if (btn) setButtonLoading(btn as HTMLButtonElement, false);
      input.value = "";
    }
  }

  document.getElementById("btn-nouvelle")?.addEventListener("click", () => {
    (document.getElementById("form-nouvelle") as HTMLFormElement)?.reset();
    newImageUrl = null;
    previewImage("preview-nouvelle", null);
    showModal(modalNouvelle);
  });
  document.getElementById("btn-annuler-nouvelle")?.addEventListener("click", () => hideModal(modalNouvelle));
  modalNouvelle?.addEventListener("click", (e) => {
    if (e.target === modalNouvelle) hideModal(modalNouvelle);
  });

  document.getElementById("input-image-nouvelle")?.addEventListener("change", (e) => {
    handleImageInput(e.target as HTMLInputElement, "preview-nouvelle", (url) => {
      newImageUrl = url;
    });
  });

  document.getElementById("form-nouvelle")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btn-submit-nouvelle") as HTMLButtonElement;
    const errEl = document.getElementById("err-nouvelle");
    await withButtonLoading(btn, async () => {
      if (errEl) errEl.classList.add("hidden");
      const res = await fetch("/api/actualites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          titre: (document.getElementById("input-titre") as HTMLInputElement).value,
          contenu: (document.getElementById("input-contenu") as HTMLTextAreaElement).value,
          statut: (document.getElementById("input-statut") as HTMLSelectElement).value,
          image_url: newImageUrl,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        if (errEl) {
          errEl.textContent = data.error || "Erreur";
          errEl.classList.remove("hidden");
        }
        return;
      }
      location.reload();
    }, "Publication…");
  });

  document.querySelectorAll<HTMLButtonElement>(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      (document.getElementById("edit-id") as HTMLInputElement).value = btn.dataset.id ?? "";
      (document.getElementById("edit-titre") as HTMLInputElement).value = btn.dataset.titre ?? "";
      (document.getElementById("edit-contenu") as HTMLTextAreaElement).value = btn.dataset.contenu ?? "";
      (document.getElementById("edit-statut") as HTMLSelectElement).value = btn.dataset.statut ?? "Brouillon";
      editImageUrl = btn.dataset.image || null;
      previewImage("preview-edit", editImageUrl);
      showModal(modalEdit);
    });
  });

  document.getElementById("input-image-edit")?.addEventListener("change", (e) => {
    handleImageInput(e.target as HTMLInputElement, "preview-edit", (url) => {
      editImageUrl = url;
    });
  });

  document.getElementById("btn-annuler-edit")?.addEventListener("click", () => hideModal(modalEdit));
  modalEdit?.addEventListener("click", (e) => {
    if (e.target === modalEdit) hideModal(modalEdit);
  });

  document.getElementById("form-edit")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btn-submit-edit") as HTMLButtonElement;
    const id = (document.getElementById("edit-id") as HTMLInputElement).value;
    const errEl = document.getElementById("err-edit");
    await withButtonLoading(btn, async () => {
      if (errEl) errEl.classList.add("hidden");
      const res = await fetch(`/api/actualites/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          titre: (document.getElementById("edit-titre") as HTMLInputElement).value,
          contenu: (document.getElementById("edit-contenu") as HTMLTextAreaElement).value,
          statut: (document.getElementById("edit-statut") as HTMLSelectElement).value,
          image_url: editImageUrl,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        if (errEl) {
          errEl.textContent = data.error || "Erreur";
          errEl.classList.remove("hidden");
        }
        return;
      }
      location.reload();
    }, "Enregistrement…");
  });

  document.querySelectorAll<HTMLButtonElement>(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Supprimer cette actualité ?")) return;
      await withButtonLoading(btn, async () => {
        const res = await fetch(`/api/actualites/${btn.dataset.id}`, {
          method: "DELETE",
          credentials: "same-origin",
        });
        if (res.ok) location.reload();
        else alert("Erreur lors de la suppression");
      }, "…");
    });
  });
}

runWhenReady(initActualitesPage);
