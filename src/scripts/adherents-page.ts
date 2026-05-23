import { setButtonLoading, withButtonLoading } from "./ui-loading";

type AdherentRow = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  statut: string;
  entreprise?: string;
  secteur?: string;
  coursInscrits: string[];
};

export function initAdherentsPage(adherents: AdherentRow[], rappelPaiement: string): void {
  function show(el: HTMLElement | null) {
    el?.classList.remove("hidden");
    el?.classList.add("flex");
  }
  function hide(el: HTMLElement | null) {
    el?.classList.add("hidden");
    el?.classList.remove("flex");
  }
  function showErr(el: HTMLElement | null, msg: string) {
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
  }
  function hideErr(el: HTMLElement | null) {
    if (!el) return;
    el.classList.add("hidden");
    el.textContent = "";
  }

  const modal = document.getElementById("modal-adherent");
  const formAdherent = document.getElementById("form-adherent") as HTMLFormElement | null;
  const modalTitre = document.getElementById("modal-titre");
  const fId = document.getElementById("f-id") as HTMLInputElement | null;
  const fPrenom = document.getElementById("f-prenom") as HTMLInputElement | null;
  const fNom = document.getElementById("f-nom") as HTMLInputElement | null;
  const fEmail = document.getElementById("f-email") as HTMLInputElement | null;
  const fPwd = document.getElementById("f-motdepasse") as HTMLInputElement | null;
  const fPwdHint = document.getElementById("f-pwd-hint");
  const fTelephone = document.getElementById("f-telephone") as HTMLInputElement | null;
  const fStatut = document.getElementById("f-statut") as HTMLSelectElement | null;
  const fEntreprise = document.getElementById("f-entreprise") as HTMLInputElement | null;
  const fSecteur = document.getElementById("f-secteur") as HTMLInputElement | null;
  const fError = document.getElementById("f-error");
  const submitBtn = document.getElementById("modal-submit") as HTMLButtonElement | null;

  const byId = new Map(adherents.map((a) => [a.id, a]));

  function openEditModal(id: string) {
    const data = byId.get(id);
    if (!data || !modalTitre || !fId || !fPrenom || !fNom || !fEmail || !fPwd || !fPwdHint || !fTelephone || !fStatut) return;
    modalTitre.textContent = "Modifier l'adhérent";
    fId.value = data.id;
    fPrenom.value = data.prenom;
    fNom.value = data.nom;
    fEmail.value = data.email;
    fEmail.readOnly = true;
    fPwd.value = "";
    fPwd.required = false;
    fPwdHint.textContent = "(laisser vide pour ne pas changer)";
    fTelephone.value = data.telephone || "";
    fStatut.value = data.statut;
    if (fEntreprise) fEntreprise.value = data.entreprise || "";
    if (fSecteur) fSecteur.value = data.secteur || "";
    hideErr(fError);
    show(modal);
  }

  document.getElementById("modal-close")?.addEventListener("click", () => hide(modal));
  document.getElementById("modal-cancel")?.addEventListener("click", () => hide(modal));

  formAdherent?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideErr(fError);
    const id = fId?.value ?? "";
    if (!id) return;

    const body: Record<string, string> = {
      prenom: fPrenom?.value.trim() ?? "",
      nom: fNom?.value.trim() ?? "",
      email: fEmail?.value.trim() ?? "",
      telephone: fTelephone?.value.trim() ?? "",
      statut: fStatut?.value ?? "Actif",
      entreprise: fEntreprise?.value.trim() ?? "",
      secteur: fSecteur?.value.trim() ?? "",
    };
    if (fPwd?.value) body.motDePasse = fPwd.value;

    await withButtonLoading(submitBtn, async () => {
      const res = await fetch(`/api/admin/adherents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showErr(fError, data.error || "Erreur");
        return;
      }
      hide(modal);
      location.reload();
    }, "Enregistrement…");
  });

  const modalCours = document.getElementById("modal-cours");
  const coursError = document.getElementById("cours-error");
  const coursSubmit = document.getElementById("modal-cours-submit") as HTMLButtonElement | null;
  let currentCoursId: string | null = null;

  document.getElementById("modal-cours-close")?.addEventListener("click", () => hide(modalCours));
  document.getElementById("modal-cours-cancel")?.addEventListener("click", () => hide(modalCours));

  document.querySelectorAll<HTMLButtonElement>(".btn-cours").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentCoursId = btn.dataset.id ?? null;
      const titre = document.getElementById("modal-cours-titre");
      if (titre) titre.textContent = "Cours de " + (btn.dataset.nom ?? "");
      const inscrits = JSON.parse(btn.dataset.cours || "[]") as string[];
      document.querySelectorAll<HTMLInputElement>(".cours-checkbox").forEach((cb) => {
        cb.checked = inscrits.includes(cb.value);
      });
      hideErr(coursError);
      show(modalCours);
    });
  });

  coursSubmit?.addEventListener("click", async () => {
    if (!currentCoursId) return;
    hideErr(coursError);
    const checked = Array.from(document.querySelectorAll<HTMLInputElement>(".cours-checkbox:checked")).map(
      (cb) => cb.value
    );
    await withButtonLoading(coursSubmit, async () => {
      const res = await fetch(`/api/admin/adherents/${currentCoursId}/cours`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ coursInscrits: checked }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showErr(coursError, data.error || "Erreur");
        return;
      }
      hide(modalCours);
      location.reload();
    }, "Enregistrement…");
  });

  const modalMsg = document.getElementById("modal-message");
  const msgTexte = document.getElementById("msg-texte") as HTMLTextAreaElement | null;
  const msgError = document.getElementById("msg-error");
  const msgSubmit = document.getElementById("modal-msg-submit") as HTMLButtonElement | null;
  let currentMsgId: string | null = null;

  document.getElementById("modal-msg-close")?.addEventListener("click", () => hide(modalMsg));
  document.getElementById("modal-msg-cancel")?.addEventListener("click", () => hide(modalMsg));

  document.querySelectorAll<HTMLButtonElement>(".btn-message").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentMsgId = btn.dataset.id ?? null;
      const titre = document.getElementById("modal-msg-titre");
      if (titre) titre.textContent = "Rappel à " + (btn.dataset.nom ?? "");
      if (msgTexte) msgTexte.value = rappelPaiement;
      hideErr(msgError);
      show(modalMsg);
    });
  });

  msgSubmit?.addEventListener("click", async () => {
    if (!currentMsgId || !msgTexte) return;
    hideErr(msgError);
    const texte = msgTexte.value.trim();
    if (!texte) {
      showErr(msgError, "Le message ne peut pas être vide.");
      return;
    }
    await withButtonLoading(msgSubmit, async () => {
      const res = await fetch(`/api/admin/adherents/${currentMsgId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ texte }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showErr(msgError, data.error || "Erreur");
        return;
      }
      hide(modalMsg);
      alert("Message envoyé avec succès.");
    }, "Envoi…");
  });

  const modalDelete = document.getElementById("modal-delete");
  const deleteConfirm = document.getElementById("modal-delete-confirm") as HTMLButtonElement | null;
  let currentDeleteId: string | null = null;

  document.getElementById("modal-delete-cancel")?.addEventListener("click", () => hide(modalDelete));

  document.querySelectorAll<HTMLButtonElement>(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentDeleteId = btn.dataset.id ?? null;
      const nomEl = document.getElementById("delete-nom");
      if (nomEl) nomEl.textContent = btn.dataset.nom ?? "";
      show(modalDelete);
    });
  });

  deleteConfirm?.addEventListener("click", async () => {
    if (!currentDeleteId) return;
    await withButtonLoading(deleteConfirm, async () => {
      const res = await fetch(`/api/admin/adherents/${currentDeleteId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        alert(data.error || "Erreur");
        return;
      }
      hide(modalDelete);
      location.reload();
    }, "Suppression…");
  });

  const search = document.getElementById("search-adherents") as HTMLInputElement | null;
  search?.addEventListener("input", () => {
    const q = search.value.toLowerCase();
    document.querySelectorAll<HTMLTableRowElement>("#tbody-adherents tr").forEach((row) => {
      row.style.display = (row.textContent?.toLowerCase() ?? "").includes(q) ? "" : "none";
    });
  });

  document.querySelectorAll<HTMLButtonElement>(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (id) openEditModal(id);
    });
  });
}
