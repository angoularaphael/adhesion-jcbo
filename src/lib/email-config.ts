/** Adresse affichée aux clients (support, problèmes). */
export function getContactEmail(): string {
  return (import.meta.env.CONTACT_EMAIL ?? "contact@jcbo-conseil.com").trim();
}

/** Destinataire des alertes admin (paiements, diagnostics…) — pas l'email perso JC Boyang. */
export function getNotifyEmail(): string {
  return (import.meta.env.NOTIFY_EMAIL ?? getContactEmail()).trim();
}

/** Expéditeur des e-mails automatiques (identifiants, newsletters, alertes adhérents). */
export function getFromEmail(): string {
  return (import.meta.env.FROM_EMAIL ?? "JCBO Conseil <no-reply@jcbo-conseil.com>").trim();
}

/** Réponses des destinataires (no-reply → contact). */
export function getReplyToEmail(): string {
  return (import.meta.env.REPLY_TO_EMAIL ?? getContactEmail()).trim();
}
