import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

/** Nettoie une variable d'environnement (guillemets, espaces). */
function cleanEnv(value: string | undefined): string {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

/**
 * Transport SMTP OVH (Email Pro).
 * Serveur typique : pro2.mail.ovh.net:587 (STARTTLS) — voir l'espace client OVH.
 */
export function createSmtpTransport() {
  const port = Number(cleanEnv(import.meta.env.SMTP_PORT) || "587");
  const host = cleanEnv(import.meta.env.SMTP_HOST) || "pro2.mail.ovh.net";
  const user = cleanEnv(import.meta.env.SMTP_USER);
  const pass = cleanEnv(import.meta.env.SMTP_PASS);
  const secure = cleanEnv(import.meta.env.SMTP_SECURE) === "true" || port === 465;

  const options: SMTPTransport.Options = {
    host,
    port,
    secure,
    auth: { user, pass },
    ...(port === 587 && !secure ? { requireTLS: true } : {}),
  };

  return nodemailer.createTransport(options);
}

export function isSmtpConfigured(): boolean {
  return !!(
    cleanEnv(import.meta.env.SMTP_USER) &&
    cleanEnv(import.meta.env.SMTP_PASS)
  );
}

/** Adresse SMTP authentifiée (doit correspondre à l'enveloppe d'envoi). */
export function getSmtpUser(): string {
  return cleanEnv(import.meta.env.SMTP_USER);
}
