import type { APIRoute } from "astro";
import { z } from "zod";
import { createDiagnosticSoumission } from "../../../lib/store-admin";
import { getAdminEmail } from "../../../lib/store-admin";
import { verifySessionFromRequest } from "../../../lib/session";
import { sendDiagnosticNotificationEmail } from "../../../lib/email";
import { addNotification } from "../../../lib/store";
import { handleCorsPreflight, jsonCorsResponse } from "../../../lib/cors";

const schema = z.object({
  donnees: z.record(z.string(), z.unknown()),
  nom: z.string().optional(),
});

export const OPTIONS: APIRoute = async ({ request }) => handleCorsPreflight(request) ?? new Response(null, { status: 204 });

export const POST: APIRoute = async ({ request }) => {
  const preflight = handleCorsPreflight(request);
  if (preflight) return preflight;

  const session = await verifySessionFromRequest(request);
  if (!session || session.role !== "diagnostic" || !session.diagnosticId) {
    return jsonCorsResponse(request, { error: "Non autorisé" }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonCorsResponse(request, { error: "Corps invalide" }, 400);
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return jsonCorsResponse(request, { error: "Données invalides" }, 400);
  }

  const nom =
    result.data.nom ||
    (typeof result.data.donnees.nom === "string" ? result.data.donnees.nom : "") ||
    session.email.split("@")[0];

  const soumission = await createDiagnosticSoumission(
    session.diagnosticId,
    session.email,
    nom,
    result.data.donnees
  );

  await sendDiagnosticNotificationEmail({
    adminEmail: getAdminEmail(),
    soumissionId: soumission.id,
    email: session.email,
    nom,
  });

  await addNotification({
    adherentEmail: getAdminEmail(),
    type: "rappel",
    titre: "Nouveau diagnostic reçu",
    message: `${nom} (${session.email}) a soumis le formulaire de diagnostic.`,
  });

  return jsonCorsResponse(request, { success: true, id: soumission.id });
};
