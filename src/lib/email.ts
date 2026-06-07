import { getContactEmail, getFromEmail, getNotifyEmail, getReplyToEmail } from "./email-config";
import { createSmtpTransport, isSmtpConfigured } from "./smtp";

const SITE_URL = import.meta.env.PUBLIC_ADHESION_URL ?? "https://adhesion-jcbo.vercel.app";

function mailBase() {
  return { from: getFromEmail(), replyTo: getReplyToEmail() };
}

function createTransport() {
  return createSmtpTransport();
}

export async function sendCredentialsEmail({
  to,
  nom,
  motDePasse,
  isReset = false,
}: {
  to: string;
  nom: string;
  motDePasse: string;
  isReset?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSmtpConfigured()) {
    return { ok: false, error: "Service email non configuré (SMTP)" };
  }

  const subject = isReset
    ? "Réinitialisation de vos accès — JCBO Conseil"
    : "Vos identifiants d'accès — JCBO Conseil";

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8f6f2;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f2;padding:40px 20px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(212,167,98,0.2);max-width:560px;">
      <tr><td style="background:linear-gradient(135deg,#0b1f3a 0%,#162d4f 100%);padding:32px 40px;text-align:center;">
        <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.2em;color:rgba(212,167,98,0.7);text-transform:uppercase;">JCBO-CONSEIL</p>
        <h1 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#ffffff;">${isReset ? "Réinitialisation de vos accès" : "Vos identifiants d'accès"}</h1>
      </td></tr>
      <tr><td style="padding:36px 40px;">
        <p style="margin:0 0 16px;font-size:15px;color:#374151;">Bonjour <strong style="color:#0b1f3a;">${nom}</strong>,</p>
        <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;">${isReset
          ? "Suite à votre demande, voici vos nouveaux identifiants de connexion à votre espace adhérent JCBO Conseil."
          : "Votre compte adhérent vient d'être créé par l'équipe JCBO Conseil. Voici vos identifiants de connexion."
        }</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(212,167,98,0.06);border-radius:12px;border:1px solid rgba(212,167,98,0.2);margin-bottom:28px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:0.2em;color:#d4a762;text-transform:uppercase;">Identifiants de connexion</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#6b7280;width:40%;">E-mail</td>
                <td style="padding:6px 0;font-size:13px;font-weight:600;color:#0b1f3a;text-align:right;">${to}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#6b7280;">Mot de passe</td>
                <td style="padding:6px 0;font-size:15px;font-weight:700;font-family:monospace;color:#d4a762;text-align:right;letter-spacing:0.05em;">${motDePasse}</td>
              </tr>
            </table>
          </td></tr>
        </table>
        <p style="margin:0 0 28px;font-size:12px;color:#9ca3af;line-height:1.6;">Pour votre sécurité, nous vous recommandons de modifier votre mot de passe après votre première connexion.</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center">
            <a href="${SITE_URL}/login" style="display:inline-block;background:#0b1f3a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:13px 36px;border-radius:100px;letter-spacing:0.06em;">ACCÉDER À MON ESPACE</a>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:20px 40px;text-align:center;border-top:1px solid #f1f3f5;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.15em;color:#0b1f3a;text-transform:uppercase;">JCBO-CONSEIL</p>
        <p style="margin:4px 0 0;font-size:11px;color:#d4a762;">Stratégie · Mindset · Performance</p>
        <p style="margin:6px 0 0;font-size:10px;color:#9ca3af;">${getContactEmail()}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  try {
    const transporter = createTransport();
    await transporter.sendMail({ ...mailBase(), to, subject, html });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur d'envoi";
    return { ok: false, error: message };
  }
}

export async function sendDiagnosticCredentialsEmail({
  to,
  nom,
  motDePasse,
  loginUrl,
}: {
  to: string;
  nom: string;
  motDePasse: string;
  loginUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSmtpConfigured()) {
    return { ok: false, error: "Service email non configuré (SMTP)" };
  }
  const html = `<!DOCTYPE html><html lang="fr"><body style="font-family:Georgia,serif;padding:24px;">
    <p>Bonjour <strong>${nom}</strong>,</p>
    <p>Voici vos identifiants pour accéder au formulaire de diagnostic JCBO Conseil (usage unique, valables 7 jours) :</p>
    <p><strong>E-mail :</strong> ${to}<br/><strong>Mot de passe :</strong> <code>${motDePasse}</code></p>
    <p><a href="${loginUrl}" style="background:#0b1f3a;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;">Accéder au diagnostic</a></p>
    <p style="color:#6b7280;font-size:12px;">Après soumission du formulaire, ces identifiants seront automatiquement révoqués.</p>
  </body></html>`;
  try {
    await createTransport().sendMail({
      ...mailBase(),
      to,
      subject: "Vos accès au diagnostic — JCBO Conseil",
      html,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur d'envoi" };
  }
}

export async function sendDiagnosticNotificationEmail({
  adminEmail,
  soumissionId,
  email,
  nom,
}: {
  adminEmail: string;
  soumissionId: string;
  email: string;
  nom: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSmtpConfigured()) return { ok: false, error: "SMTP non configuré" };
  const dashUrl = `${SITE_URL}/dashboard/diagnostics`;
  try {
    await createTransport().sendMail({
      ...mailBase(),
      to: adminEmail,
      replyTo: email,
      subject: `[JCBO] Nouveau diagnostic — ${nom}`,
      html: `<p>Un nouveau formulaire de diagnostic a été soumis.</p>
        <p><strong>Nom :</strong> ${nom}<br/><strong>E-mail :</strong> ${email}<br/><strong>Réf. :</strong> ${soumissionId}</p>
        <p><a href="${dashUrl}">Voir dans le dashboard</a></p>`,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur" };
  }
}

export async function sendResourceDownloadEmail({
  to,
  nom,
  resourceTitle,
  fileBuffer,
  fileName,
}: {
  to: string;
  nom: string;
  resourceTitle: string;
  fileBuffer?: Buffer;
  fileName?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSmtpConfigured()) {
    return { ok: false, error: "Service email non configuré (SMTP)" };
  }
  const vitrineUrl = import.meta.env.PUBLIC_VITRINE_URL ?? "https://jcboyang-conseil.vercel.app";
  const html = `<!DOCTYPE html><html lang="fr"><body style="font-family:Georgia,serif;padding:24px;color:#374151;">
    <p>Bonjour <strong>${nom}</strong>,</p>
    <p>Merci pour votre intérêt pour JCBO Conseil. Voici la ressource demandée :</p>
    <p style="background:#f8f6f2;padding:16px;border-radius:8px;border:1px solid rgba(212,167,98,0.3);"><strong>${resourceTitle}</strong></p>
    ${fileBuffer ? '<p>Vous trouverez le document en <strong>pièce jointe</strong> de cet e-mail.</p>' : '<p><em>Document non joint : l’administrateur doit publier le fichier dans le dashboard (Ressources, même titre que sur la vitrine).</em></p>'}
    <p>Notre équipe vous contactera si vous souhaitez un accompagnement personnalisé.</p>
    <p><a href="${vitrineUrl}/reserver" style="background:#0b1f3a;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;">Réserver une séance</a></p>
    <p style="color:#9ca3af;font-size:12px;">JCBO Conseil — ${getContactEmail()}</p>
  </body></html>`;

  const attachments = fileBuffer && fileName
    ? [{ filename: fileName, content: fileBuffer }]
    : [];

  try {
    await createTransport().sendMail({
      ...mailBase(),
      to,
      subject: `Votre ressource : ${resourceTitle}`,
      html,
      attachments,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur d'envoi" };
  }
}

/**
 * Envoie un email récap d'un événement aux administrateurs (paiement, cours terminé, certificat…).
 * Cible `NOTIFY_EMAIL` (contact@jcbo-conseil.com par défaut, pas jcboyang@).
 */
export async function sendAdminEventEmail(payload: {
  type: string;
  titre: string;
  message: string;
  metadata?: Record<string, unknown>;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSmtpConfigured()) {
    return { ok: false, error: "Service email non configuré (SMTP)" };
  }
  const adminEmail = getNotifyEmail();

  const meta = payload.metadata ?? {};
  const detailsRows = Object.entries(meta)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => {
      const val = typeof v === "object" ? JSON.stringify(v) : String(v);
      const escaped = val.length > 200 ? val.slice(0, 200) + "…" : val;
      return `<tr><td style="padding:5px 0;font-size:13px;color:#6b7280;width:38%;">${k}</td><td style="padding:5px 0;font-size:13px;color:#0b1f3a;">${escaped}</td></tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="fr"><body style="margin:0;padding:0;background:#f8f6f2;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f2;padding:40px 20px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(212,167,98,0.2);max-width:560px;">
      <tr><td style="background:linear-gradient(135deg,#0b1f3a 0%,#162d4f 100%);padding:32px 40px;text-align:center;">
        <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.2em;color:rgba(212,167,98,0.7);text-transform:uppercase;">JCBO-CONSEIL — Admin</p>
        <h1 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#ffffff;">${payload.titre}</h1>
      </td></tr>
      <tr><td style="padding:32px 40px;">
        <p style="margin:0 0 18px;font-size:14px;color:#374151;line-height:1.6;">${payload.message}</p>
        ${detailsRows ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f2;border-radius:10px;border:1px solid rgba(212,167,98,0.18);">
          <tr><td style="padding:14px 18px;"><table width="100%" cellpadding="0" cellspacing="0">${detailsRows}</table></td></tr>
        </table>` : ""}
        <p style="margin:24px 0 0;font-size:11px;color:#9ca3af;line-height:1.6;">Cet événement est aussi disponible dans votre dashboard administrateur, cloche de notifications.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  try {
    await createTransport().sendMail({
      ...mailBase(),
      to: adminEmail,
      subject: `[JCBO] ${payload.titre}`,
      html,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur d'envoi" };
  }
}

/** Alerte adhérents : nouvelle actualité, cours ou ressource. */
export async function sendAdherentContentEmail({
  to,
  nom,
  titre,
  message,
  ctaLabel,
  ctaUrl,
}: {
  to: string;
  nom: string;
  titre: string;
  message: string;
  ctaLabel: string;
  ctaUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSmtpConfigured()) return { ok: false, error: "SMTP non configuré" };

  const html = `<!DOCTYPE html><html lang="fr"><body style="margin:0;padding:0;background:#f8f6f2;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f2;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(212,167,98,0.2);max-width:560px;">
<tr><td style="background:linear-gradient(135deg,#0b1f3a,#162d4f);padding:28px 36px;text-align:center;">
<p style="margin:0;font-size:11px;letter-spacing:0.2em;color:rgba(212,167,98,0.7);">JCBO CONSEIL</p>
<h1 style="margin:8px 0 0;font-size:18px;color:#fff;">${titre}</h1>
</td></tr>
<tr><td style="padding:32px 36px;">
<p style="margin:0 0 12px;font-size:15px;color:#374151;">Bonjour <strong>${nom}</strong>,</p>
<p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;">${message}</p>
<a href="${ctaUrl}" style="display:inline-block;background:#0b1f3a;color:#fff;text-decoration:none;font-size:13px;font-weight:700;padding:12px 28px;border-radius:100px;">${ctaLabel}</a>
</td></tr>
<tr><td style="padding:16px 36px 24px;text-align:center;border-top:1px solid #f1f3f5;">
<p style="margin:0;font-size:10px;color:#9ca3af;">Besoin d'aide ? ${getContactEmail()}</p>
</td></tr>
</table></td></tr></table></body></html>`;

  try {
    await createTransport().sendMail({
      ...mailBase(),
      to,
      subject: `[JCBO] ${titre}`,
      html,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur d'envoi" };
  }
}

export async function sendNewsletterConfirmation(to: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSmtpConfigured()) return { ok: false, error: "SMTP non configuré" };
  try {
    await createTransport().sendMail({
      ...mailBase(),
      to,
      subject: "Inscription newsletter — JCBO Conseil",
      html: `<p>Merci pour votre inscription à la newsletter JCBO Conseil.</p>`,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur" };
  }
}
