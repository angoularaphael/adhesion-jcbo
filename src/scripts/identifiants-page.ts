import { runWhenReady, withButtonLoading } from "./ui-loading";

export function initIdentifiantsPage(): void {
  document.querySelectorAll<HTMLButtonElement>(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      document.getElementById("panel-adherents")?.classList.toggle("hidden", tab !== "adherents");
      document.getElementById("panel-diagnostic")?.classList.toggle("hidden", tab !== "diagnostic");
      document.querySelectorAll<HTMLButtonElement>(".tab-btn").forEach((b) => {
        const active = b.dataset.tab === tab;
        b.style.background = active ? "#0b1f3a" : "";
        b.style.color = active ? "#fff" : "";
        b.classList.toggle("bg-gray-100", !active);
      });
    });
  });

  const modalDiag = document.getElementById("modal-diag");
  document.getElementById("btn-diag-generer")?.addEventListener("click", () => {
    modalDiag?.classList.replace("hidden", "flex");
  });
  document.getElementById("diag-cancel")?.addEventListener("click", () => {
    modalDiag?.classList.replace("flex", "hidden");
  });
  document.getElementById("form-diag")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.querySelector<HTMLButtonElement>("#form-diag button[type='submit']");
    const err = document.getElementById("diag-err");
    await withButtonLoading(btn, async () => {
      if (err) err.classList.add("hidden");
      const res = await fetch("/api/diagnostic/acces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email: (document.getElementById("diag-email") as HTMLInputElement).value,
          nom: (document.getElementById("diag-nom") as HTMLInputElement).value,
        }),
      });
      if (res.ok) {
        location.reload();
        return;
      }
      const d = (await res.json()) as { error?: string };
      if (err) {
        err.textContent = d.error || "Erreur";
        err.classList.remove("hidden");
      }
    }, "Envoi…");
  });

  const modal = document.getElementById("modal-generer");
  const modalReset = document.getElementById("modal-reset");
  let resetId = "";

  document.getElementById("btn-generer")?.addEventListener("click", () => {
    (document.getElementById("form-generer") as HTMLFormElement)?.reset();
    document.getElementById("result-genere")?.classList.add("hidden");
    document.getElementById("result-fallback")?.classList.add("hidden");
    document.getElementById("err-generer")?.classList.add("hidden");
    const btn = document.getElementById("btn-submit-generer") as HTMLButtonElement;
    btn.disabled = false;
    btn.textContent = "Créer & envoyer";
    modal?.classList.replace("hidden", "flex");
  });

  document.getElementById("btn-annuler")?.addEventListener("click", () => {
    modal?.classList.replace("flex", "hidden");
    location.reload();
  });
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.replace("flex", "hidden");
      location.reload();
    }
  });

  document.getElementById("form-generer")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btn-submit-generer") as HTMLButtonElement;
    const errEl = document.getElementById("err-generer");
    await withButtonLoading(btn, async () => {
      if (errEl) errEl.classList.add("hidden");
      const res = await fetch("/api/identifiants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          nom: (document.getElementById("input-nom") as HTMLInputElement).value,
          email: (document.getElementById("input-email") as HTMLInputElement).value,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        email?: string;
        motDePasse?: string;
        numeroAdherent?: string;
        emailSent?: boolean;
        emailError?: string;
      };

      if (res.ok) {
        const resultBox = document.getElementById("result-genere");
        const dest = document.getElementById("result-email-dest");
        const fallback = document.getElementById("result-fallback");
        const resEmail = document.getElementById("res-email");
        const resPassword = document.getElementById("res-password");
        const resNumero = document.getElementById("res-numero");

        if (data.emailSent) {
          if (dest) dest.textContent = `Les identifiants ont été envoyés par e-mail à ${data.email}.`;
          fallback?.classList.add("hidden");
        } else {
          if (dest) {
            dest.textContent =
              data.emailError ??
              "L'envoi e-mail a échoué. Communiquez les accès ci-dessous manuellement.";
          }
          if (resEmail) resEmail.textContent = data.email ?? "";
          if (resPassword) resPassword.textContent = data.motDePasse ?? "—";
          if (resNumero) resNumero.textContent = data.numeroAdherent ?? "—";
          fallback?.classList.remove("hidden");
        }

        resultBox?.classList.remove("hidden");
        btn.textContent = "Créé ✓";
        btn.disabled = true;

        const count = document.getElementById("count");
        if (count) count.textContent = String(Number(count.textContent) + 1);

        setTimeout(() => location.reload(), 2500);
        return;
      }

      if (errEl) {
        errEl.textContent = data.error || "Erreur lors de la création.";
        errEl.classList.remove("hidden");
      }
    }, "Création…");
  });

  document.querySelectorAll<HTMLButtonElement>(".btn-reset-acces").forEach((btn) => {
    btn.addEventListener("click", () => {
      resetId = btn.dataset.id ?? "";
      const resetNom = document.getElementById("reset-nom");
      const resetEmail = document.getElementById("reset-email");
      if (resetNom) resetNom.textContent = btn.dataset.nom ?? "";
      if (resetEmail) resetEmail.textContent = btn.dataset.email ?? "";
      document.getElementById("reset-result")?.classList.add("hidden");
      document.getElementById("reset-fallback")?.classList.add("hidden");
      document.getElementById("reset-error")?.classList.add("hidden");
      const confirmBtn = document.getElementById("btn-confirmer-reset") as HTMLButtonElement;
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Régénérer";
      modalReset?.classList.replace("hidden", "flex");
    });
  });

  document.getElementById("btn-annuler-reset")?.addEventListener("click", () => {
    modalReset?.classList.replace("flex", "hidden");
  });
  modalReset?.addEventListener("click", (e) => {
    if (e.target === modalReset) modalReset.classList.replace("flex", "hidden");
  });

  document.getElementById("btn-confirmer-reset")?.addEventListener("click", async () => {
    const btn = document.getElementById("btn-confirmer-reset") as HTMLButtonElement;
    const errEl = document.getElementById("reset-error");
    await withButtonLoading(btn, async () => {
      if (errEl) errEl.classList.add("hidden");
      const res = await fetch("/api/identifiants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id: resetId }),
      });
      const data = (await res.json()) as { motDePasse?: string; emailSent?: boolean; emailError?: string; error?: string };

      if (res.ok) {
        const resultBox = document.getElementById("reset-result");
        const fallback = document.getElementById("reset-fallback");
        const resetPassword = document.getElementById("reset-password");
        if (!data.emailSent) {
          fallback?.classList.remove("hidden");
          if (resetPassword) {
            resetPassword.textContent = data.motDePasse ?? data.emailError ?? "Mot de passe indisponible";
          }
        }
        resultBox?.classList.remove("hidden");
        btn.textContent = "Envoyé ✓";
        btn.disabled = true;
        return;
      }

      if (errEl) {
        errEl.textContent = data.error || "Erreur.";
        errEl.classList.remove("hidden");
      }
    }, "Envoi…");
  });

  document.querySelectorAll<HTMLButtonElement>(".btn-toggle").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await withButtonLoading(btn, async () => {
        const res = await fetch("/api/identifiants", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ id: btn.dataset.id }),
        });
        if (res.ok) location.reload();
      }, "…");
    });
  });
}

runWhenReady(initIdentifiantsPage);
