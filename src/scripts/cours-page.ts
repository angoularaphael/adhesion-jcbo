import { runWhenReady, setButtonLoading, uploadFile, withButtonLoading } from "./ui-loading";

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
  let modulesLoadSeq = 0;

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

  function escapeHtml(s: string): string {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
  }

  function normalizeModuleType(type: string): "Quiz" | "Document" | "Vidéo" {
    const t = type.trim().toLowerCase();
    if (t === "quiz" || t === "quizz") return "Quiz";
    if (t === "document") return "Document";
    return "Vidéo";
  }

  function renderModuleItem(mod: ModuleRow): string {
    const kind = normalizeModuleType(mod.type);
    const fileInfo = mod.fichierUrl
      ? `<a href="/api/cours/fichier/${escapeHtml(mod.id)}" class="text-xs text-blue-600 hover:underline">Document enregistré — tester le téléchargement</a>`
      : `<span class="text-xs text-gray-400">Aucun fichier</span>`;
    const videoInfo = mod.videoUrl
      ? `<a href="${escapeHtml(mod.videoUrl)}" target="_blank" class="text-xs text-blue-600 hover:underline truncate block max-w-xs">${escapeHtml(mod.videoUrl)}</a>`
      : `<span class="text-xs text-gray-400">Aucune vidéo</span>`;

    let bodyHtml = "";
    if (kind === "Quiz") {
      bodyHtml = `
        <div class="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 p-4">
          <p class="text-xs text-gray-500 mb-3">Ce module est un quiz : configurez les questions (pas de fichier ni de vidéo).</p>
          <button type="button" class="btn-edit-quiz px-4 py-2 rounded-lg text-xs font-semibold text-white" style="background:#d4a762;">Gérer les questions du quiz</button>
        </div>`;
    } else if (kind === "Document") {
      bodyHtml = `
        <div>
          <p class="text-xs text-gray-400 mb-1">Fichier de cours (PDF, DOC…)</p>
          <div class="file-info">${fileInfo}</div>
          <label class="mt-2 inline-flex cursor-pointer">
            <span class="btn-upload-file px-3 py-1.5 rounded-lg text-xs border border-gray-200 hover:bg-gray-50">Choisir un fichier</span>
            <input type="file" class="input-module-file hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,application/pdf" />
          </label>
        </div>
        <button type="button" class="btn-save-module mt-3 px-4 py-2 rounded-lg text-xs font-semibold text-white" style="background:#0b1f3a;">Enregistrer le document</button>`;
    } else {
      bodyHtml = `
        <div>
          <p class="text-xs text-gray-400 mb-1">Vidéo (URL ou upload)</p>
          <div class="video-info">${videoInfo}</div>
          <input type="url" class="input-module-video w-full mt-2 border rounded-lg px-3 py-2 text-xs" placeholder="https://youtu.be/…" value="${escapeHtml(mod.videoUrl ?? "")}" />
          <label class="mt-2 inline-flex cursor-pointer">
            <span class="btn-upload-video px-3 py-1.5 rounded-lg text-xs border border-gray-200 hover:bg-gray-50">Uploader une vidéo</span>
            <input type="file" class="input-module-video-file hidden" accept="video/mp4,video/webm,video/quicktime" />
          </label>
        </div>
        <button type="button" class="btn-save-module mt-3 px-4 py-2 rounded-lg text-xs font-semibold text-white" style="background:#0b1f3a;">Enregistrer la vidéo</button>`;
    }

    const quizHeaderBtn =
      kind === "Quiz"
        ? ""
        : `<button type="button" class="btn-edit-quiz text-xs font-semibold hover:underline hidden" style="color:#d4a762;" title="Gérer le quiz">Quiz</button>`;

    return `
      <div class="border border-gray-100 rounded-xl p-4 module-item" data-module-id="${escapeHtml(mod.id)}" data-module-type="${kind}">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div>
            <p class="text-sm font-semibold" style="color:#0b1f3a;">${escapeHtml(mod.titre)}</p>
            <p class="text-xs text-gray-400">${escapeHtml(kind)}${mod.duree ? " · " + escapeHtml(mod.duree) : ""}</p>
          </div>
          <div class="flex items-center gap-3">
            ${quizHeaderBtn}
            <button type="button" class="btn-delete-module text-xs text-red-500 hover:underline" title="Supprimer ce module">Supprimer</button>
          </div>
        </div>
        ${bodyHtml}
      </div>`;
  }

  type QuizQuestion = { id?: string; question: string; options: string[]; correcte: number };

  function openQuizModal(moduleId: string, moduleTitre: string) {
    const overlay = document.getElementById("modal-quiz-admin");
    if (!overlay) return;

    const titleEl = overlay.querySelector("#quiz-admin-titre");
    if (titleEl) titleEl.textContent = "Quiz — " + moduleTitre;

    const list = overlay.querySelector("#quiz-admin-list") as HTMLElement | null;
    const errBox = overlay.querySelector("#quiz-admin-error") as HTMLElement | null;
    if (errBox) {
      errBox.classList.add("hidden");
      errBox.textContent = "";
    }
    if (list) list.innerHTML = `<p class="text-sm text-gray-400">Chargement…</p>`;
    overlay.classList.remove("hidden");
    overlay.classList.add("flex");

    let questions: QuizQuestion[] = [];

    function renderList() {
      if (!list) return;
      if (questions.length === 0) {
        list.innerHTML = `<p class="text-sm text-gray-400">Aucune question pour l'instant. Cliquez sur « Ajouter une question ».</p>`;
        return;
      }
      list.innerHTML = questions
        .map(
          (q, qi) => `
        <div class="border border-gray-100 rounded-xl p-4 quiz-q-item" data-qi="${qi}">
          <div class="flex items-start justify-between gap-3 mb-2">
            <p class="text-xs font-bold uppercase tracking-wide" style="color:#0b1f3a;">Question ${qi + 1}</p>
            <button type="button" class="btn-del-q text-xs text-red-500 hover:underline">Supprimer</button>
          </div>
          <input class="q-text w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3" placeholder="Énoncé de la question" value="${escapeHtml(q.question)}" />
          <div class="q-options flex flex-col gap-2">
            ${q.options
              .map(
                (opt, oi) => `
              <label class="flex items-center gap-2 border border-gray-100 rounded-lg px-2 py-1.5">
                <input type="radio" name="q-${qi}-correct" class="q-correct-radio" data-oi="${oi}" ${oi === q.correcte ? "checked" : ""} />
                <input class="q-option flex-1 border border-transparent rounded px-2 py-1 text-sm focus:border-gray-200 outline-none" placeholder="Option ${oi + 1}" value="${escapeHtml(opt)}" />
                <button type="button" class="btn-del-opt text-xs text-gray-400 hover:text-red-500" title="Supprimer cette option">×</button>
              </label>`
              )
              .join("")}
          </div>
          <button type="button" class="btn-add-opt mt-2 text-xs font-semibold hover:underline" style="color:#d4a762;">+ Ajouter une option</button>
        </div>`
        )
        .join("");
      bindListEvents();
    }

    function readListIntoModel() {
      if (!list) return;
      list.querySelectorAll<HTMLElement>(".quiz-q-item").forEach((item) => {
        const qi = Number(item.dataset.qi ?? -1);
        if (qi < 0 || !questions[qi]) return;
        const text = (item.querySelector(".q-text") as HTMLInputElement | null)?.value ?? "";
        const options = Array.from(item.querySelectorAll<HTMLInputElement>(".q-option")).map(
          (i) => i.value
        );
        const radio = item.querySelector<HTMLInputElement>(".q-correct-radio:checked");
        const correcte = radio ? Number(radio.dataset.oi) : 0;
        questions[qi] = { ...questions[qi], question: text, options, correcte };
      });
    }

    function bindListEvents() {
      list?.querySelectorAll<HTMLElement>(".quiz-q-item").forEach((item) => {
        const qi = Number(item.dataset.qi ?? -1);
        if (qi < 0) return;

        item.querySelector(".btn-del-q")?.addEventListener("click", () => {
          readListIntoModel();
          questions.splice(qi, 1);
          renderList();
        });

        item.querySelector(".btn-add-opt")?.addEventListener("click", () => {
          readListIntoModel();
          questions[qi].options.push("");
          renderList();
        });

        item.querySelectorAll<HTMLButtonElement>(".btn-del-opt").forEach((b, idx) => {
          b.addEventListener("click", () => {
            readListIntoModel();
            if (questions[qi].options.length <= 2) {
              if (errBox) {
                errBox.textContent = "Une question doit avoir au moins 2 options.";
                errBox.classList.remove("hidden");
              }
              return;
            }
            questions[qi].options.splice(idx, 1);
            if (questions[qi].correcte >= questions[qi].options.length) {
              questions[qi].correcte = 0;
            }
            renderList();
          });
        });
      });
    }

    const btnAdd = overlay.querySelector("#btn-quiz-add-question") as HTMLButtonElement | null;
    btnAdd?.addEventListener("click", () => {
      readListIntoModel();
      questions.push({ question: "", options: ["", ""], correcte: 0 });
      renderList();
    }, { once: false });

    const btnClose = overlay.querySelector("#btn-quiz-close") as HTMLButtonElement | null;
    btnClose?.addEventListener("click", () => {
      overlay.classList.add("hidden");
      overlay.classList.remove("flex");
    });

    const btnSave = overlay.querySelector("#btn-quiz-save") as HTMLButtonElement | null;
    btnSave?.addEventListener("click", async () => {
      readListIntoModel();

      // Validation côté client
      for (const [qi, q] of questions.entries()) {
        if (!q.question.trim() || q.question.trim().length < 3) {
          if (errBox) {
            errBox.textContent = `Question ${qi + 1} : énoncé manquant.`;
            errBox.classList.remove("hidden");
          }
          return;
        }
        if (q.options.length < 2 || q.options.some((o) => !o.trim())) {
          if (errBox) {
            errBox.textContent = `Question ${qi + 1} : il faut au moins 2 options remplies.`;
            errBox.classList.remove("hidden");
          }
          return;
        }
      }

      await withButtonLoading(btnSave, async () => {
        const res = await fetch(`/api/modules/${moduleId}/quiz`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ questions }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          if (errBox) {
            errBox.textContent = data.error ?? "Erreur lors de l'enregistrement.";
            errBox.classList.remove("hidden");
          }
          return;
        }
        overlay.classList.add("hidden");
        overlay.classList.remove("flex");
      }, "Enregistrement…");
    }, { once: false });

    // Charger les questions existantes
    fetch(`/api/modules/${moduleId}/quiz`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data: { questions?: QuizQuestion[]; error?: string }) => {
        if (data.error) {
          if (list) list.innerHTML = `<p class="text-sm text-red-500">${data.error}</p>`;
          return;
        }
        questions = (data.questions ?? []).map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correcte: q.correcte,
        }));
        renderList();
      })
      .catch(() => {
        if (list) list.innerHTML = `<p class="text-sm text-red-500">Erreur de chargement.</p>`;
      });
  }

  async function loadModules(coursId: string, coursTitre: string) {
    currentCoursId = coursId;
    const seq = ++modulesLoadSeq;
    const titleEl = document.getElementById("modal-modules-titre");
    if (titleEl) titleEl.textContent = "Contenu — " + coursTitre;
    if (modulesList) modulesList.innerHTML = `<p class="text-sm text-gray-400">Chargement…</p>`;
    modalModules?.classList.remove("hidden");

    const res = await fetch(`/api/cours/${coursId}/modules`, { credentials: "same-origin" });
    const data = (await res.json()) as { modules?: ModuleRow[]; error?: string };

    if (seq !== modulesLoadSeq || currentCoursId !== coursId) return;

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
          const fileBlock = item?.querySelector(".file-info");
          if (fileBlock) {
            fileBlock.innerHTML = `<span class="text-xs text-green-700">Fichier prêt — cliquez sur « Enregistrer le document »</span>`;
          }
        } catch (e) {
          alert(e instanceof Error ? e.message : "Erreur upload");
        } finally {
          if (btn) setButtonLoading(btn as HTMLButtonElement, false);
          input.value = "";
        }
      });
    });

    modulesList?.querySelectorAll<HTMLInputElement>(".input-module-video-file").forEach((input) => {
      input.addEventListener("change", async () => {
        const file = input.files?.[0];
        if (!file) return;
        const item = input.closest(".module-item");
        const btn = item?.querySelector<HTMLElement>(".btn-upload-video");
        if (btn) setButtonLoading(btn as HTMLButtonElement, true, "Upload vidéo…");
        try {
          const { url } = await uploadFile(file, "videos-formation", "video");
          const videoInput = item?.querySelector<HTMLInputElement>(".input-module-video");
          if (videoInput) videoInput.value = url;
          const videoBlock = item?.querySelector(".video-info");
          if (videoBlock) {
            videoBlock.innerHTML = `<a href="${url}" target="_blank" class="text-xs text-blue-600 hover:underline truncate block max-w-xs">Vidéo prête à enregistrer</a>`;
          }
        } catch (e) {
          alert(e instanceof Error ? e.message : "Erreur upload vidéo");
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
        const kind = normalizeModuleType(item?.getAttribute("data-module-type") ?? "Vidéo");
        const body: Record<string, string> = {};
        if (kind === "Document") {
          const pendingFile = item?.getAttribute("data-pending-file");
          if (pendingFile) body.fichier_url = pendingFile;
          else if (!item?.querySelector(".file-info a")) {
            alert("Choisissez un fichier à enregistrer.");
            return;
          }
        } else if (kind === "Vidéo") {
          const videoInput = item?.querySelector<HTMLInputElement>(".input-module-video");
          const url = videoInput?.value.trim() ?? "";
          if (!url) {
            alert("Indiquez une URL ou uploadez une vidéo.");
            return;
          }
          body.video_url = url;
        }

        await withButtonLoading(btn, async () => {
          const res = await fetch(`/api/modules/${moduleId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify(body),
          });
          let data: { error?: string } = {};
          try {
            data = (await res.json()) as { error?: string };
          } catch {
            data = { error: "Réponse serveur invalide." };
          }
          if (!res.ok) {
            alert(data.error || `Erreur (${res.status})`);
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

    modulesList?.querySelectorAll<HTMLButtonElement>(".btn-edit-quiz").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".module-item");
        const moduleId = item?.getAttribute("data-module-id");
        const titreEl = item?.querySelector("p.text-sm.font-semibold");
        const titre = titreEl?.textContent ?? "Module";
        if (moduleId) openQuizModal(moduleId, titre);
      });
    });

    modulesList?.querySelectorAll<HTMLButtonElement>(".btn-delete-module").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const item = btn.closest(".module-item");
        const moduleId = item?.getAttribute("data-module-id");
        if (!moduleId) return;
        if (!confirm("Supprimer ce module ?")) return;
        await withButtonLoading(btn, async () => {
          const res = await fetch(`/api/modules/${moduleId}`, { method: "DELETE", credentials: "same-origin" });
          if (!res.ok) {
            alert("Erreur lors de la suppression du module.");
            return;
          }
          if (currentCoursId) {
            const titre = document.getElementById("modal-modules-titre")?.textContent?.replace("Contenu — ", "") ?? "";
            await loadModules(currentCoursId, titre);
          }
        }, "…");
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

runWhenReady(initCoursPage);
