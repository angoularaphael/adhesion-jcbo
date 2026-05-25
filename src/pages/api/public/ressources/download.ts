import type { APIRoute } from "astro";
import { z } from "zod";
import { subscribeNewsletter, enregistrerTelechargement } from "../../../../lib/store-admin";
import { getRessources } from "../../../../lib/store";
import { findRessourceMatch, getRessourceFileAttachment } from "../../../../lib/ressource-fichier";
import { sendResourceDownloadEmail } from "../../../../lib/email";
import { handleCorsPreflight, jsonCorsResponse } from "../../../../lib/cors";
import { checkRateLimit } from "../../../../lib/rateLimit";

const schema = z.object({
  email: z.string().email(),
  nom: z.string().min(2).max(120),
  prenom: z.string().min(2).max(120),
  profession: z.string().min(2).max(200),
  resource: z.string().min(2).max(300),
  resourceId: z.string().max(80).optional(),
  newsletter: z.boolean().optional(),
});

export const OPTIONS: APIRoute = async ({ request }) => handleCorsPreflight(request) ?? new Response(null, { status: 204 });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const preflight = handleCorsPreflight(request);
  if (preflight) return preflight;

  const { allowed } = checkRateLimit(`ressource-dl:${clientAddress}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return jsonCorsResponse(request, { error: "Trop de requêtes. Réessayez plus tard." }, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonCorsResponse(request, { error: "Corps invalide" }, 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonCorsResponse(request, { error: parsed.error.issues[0].message }, 400);
  }

  if (parsed.data.newsletter !== false) {
    await subscribeNewsletter(parsed.data.email);
  }

  await enregistrerTelechargement({
    nom: parsed.data.nom,
    prenom: parsed.data.prenom,
    email: parsed.data.email,
    profession: parsed.data.profession,
    resource: parsed.data.resource,
  });

  let fileBuffer: Buffer | undefined;
  let fileName: string | undefined;

  try {
    const ressources = await getRessources();
    const match = findRessourceMatch(ressources, {
      resourceId: parsed.data.resourceId,
      resourceTitle: parsed.data.resource,
    });
    if (match) {
      const attachment = await getRessourceFileAttachment(match);
      if (attachment) {
        fileBuffer = attachment.buffer;
        fileName = attachment.fileName;
      }
    }
  } catch {
    // envoi sans pièce jointe si erreur lecture fichier
  }

  const emailResult = await sendResourceDownloadEmail({
    to: parsed.data.email,
    nom: `${parsed.data.prenom} ${parsed.data.nom}`,
    resourceTitle: parsed.data.resource,
    fileBuffer,
    fileName,
  });

  if (!emailResult.ok) {
    return jsonCorsResponse(request, { error: emailResult.error ?? "Échec envoi e-mail" }, 502);
  }

  if (!fileBuffer) {
    return jsonCorsResponse(request, {
      success: true,
      emailSent: true,
      warning: "Email envoyé sans pièce jointe : vérifiez que la ressource existe dans l'admin avec le même titre et un fichier uploadé.",
    });
  }

  return jsonCorsResponse(request, { success: true, emailSent: true, attachment: true });
};
