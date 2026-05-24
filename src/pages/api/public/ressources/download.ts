import type { APIRoute } from "astro";
import { z } from "zod";
import { subscribeNewsletter, enregistrerTelechargement } from "../../../../lib/store-admin";
import { getRessources } from "../../../../lib/store";
import { sendResourceDownloadEmail } from "../../../../lib/email";
import { handleCorsPreflight, jsonCorsResponse } from "../../../../lib/cors";
import { checkRateLimit } from "../../../../lib/rateLimit";

const schema = z.object({
  email: z.string().email(),
  nom: z.string().min(2).max(120),
  prenom: z.string().min(2).max(120),
  profession: z.string().min(2).max(200),
  resource: z.string().min(2).max(300),
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
    const match = ressources.find(
      (r: { titre?: string; nom_fichier?: string }) =>
        r.titre === parsed.data.resource || r.nom_fichier === parsed.data.resource
    );
    if (match && match.fichier && match.fichier.startsWith("data:")) {
      const parts = match.fichier.split(",");
      fileBuffer = Buffer.from(parts[1], "base64");
      fileName = match.nom_fichier || `${parsed.data.resource}.pdf`;
    }
  } catch {
    // Si pas trouvé, on envoie sans pièce jointe
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

  return jsonCorsResponse(request, { success: true, emailSent: true });
};
