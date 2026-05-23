function getInputValue(id: string): string {
  const el = document.getElementById(id);
  return el instanceof HTMLInputElement ? el.value : "";
}

function getCheckboxChecked(id: string): boolean {
  const el = document.getElementById(id);
  return el instanceof HTMLInputElement ? el.checked : false;
}

function showModal(el: HTMLElement | null): void {
  el?.classList.remove("hidden");
  el?.classList.add("flex");
}

function hideModal(el: HTMLElement | null): void {
  el?.classList.add("hidden");
  el?.classList.remove("flex");
}

export function initAdminsPage(): void {
  const modalCreate = document.getElementById("modal-create");
  const modalPwd = document.getElementById("modal-pwd");
  const pwdDisplay = document.getElementById("pwd-display");
  const pwdEmailNote = document.getElementById("pwd-email-note");
  const caErr = document.getElementById("ca-err");

  function showPassword(motDePasse: string, emailSent: boolean): void {
    if (pwdDisplay) pwdDisplay.textContent = motDePasse;
    if (pwdEmailNote) {
      pwdEmailNote.textContent = emailSent
        ? "Un e-mail avec les identifiants a été envoyé."
        : "L'e-mail n'a pas pu être envoyé — transmettez le mot de passe manuellement.";
      pwdEmailNote.classList.remove("hidden");
    }
    showModal(modalPwd);
  }

  document.getElementById("btn-new-admin")?.addEventListener("click", () => showModal(modalCreate));
  document.getElementById("ca-cancel")?.addEventListener("click", () => hideModal(modalCreate));
  document.getElementById("pwd-close")?.addEventListener("click", () => {
    hideModal(modalPwd);
    window.location.reload();
  });

  document.getElementById("form-create")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (caErr) {
      caErr.classList.add("hidden");
      caErr.textContent = "";
    }

    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prenom: getInputValue("ca-prenom"),
        nom: getInputValue("ca-nom"),
        email: getInputValue("ca-email"),
        telephone: getInputValue("ca-tel") || undefined,
        envoyerEmail: getCheckboxChecked("ca-send-email"),
      }),
    });

    const data = (await res.json()) as {
      error?: string;
      motDePasse?: string;
      emailSent?: boolean;
    };

    if (!res.ok) {
      if (caErr) {
        caErr.textContent = data.error || "Erreur";
        caErr.classList.remove("hidden");
      }
      return;
    }

    hideModal(modalCreate);
    if (data.motDePasse) {
      showPassword(data.motDePasse, !!data.emailSent);
    }
  });

  document.querySelectorAll<HTMLButtonElement>(".btn-reset-pwd").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (!id || !confirm("Régénérer le mot de passe de cet administrateur ?")) return;

      const res = await fetch(`/api/admin/admins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenererMotDePasse: true, envoyerEmail: true }),
      });

      const data = (await res.json()) as { error?: string; motDePasse?: string };
      if (!res.ok) {
        alert(data.error || "Erreur");
        return;
      }
      if (data.motDePasse) showPassword(data.motDePasse, true);
    });
  });

  document.querySelectorAll<HTMLButtonElement>(".btn-toggle-statut").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const current = btn.getAttribute("data-statut");
      const next = current === "Actif" ? "Inactif" : "Actif";
      if (!id || !confirm(next === "Inactif" ? "Désactiver ce compte ?" : "Réactiver ce compte ?")) return;

      const res = await fetch(`/api/admin/admins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: next }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        alert(data.error || "Erreur");
        return;
      }
      window.location.reload();
    });
  });
}

document.addEventListener("DOMContentLoaded", initAdminsPage);
