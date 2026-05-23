import type { APIRoute } from "astro";
import { z } from "zod";
import { verifyDiagnosticLogin } from "../../../lib/store-admin";
import { createSession } from "../../../lib/session";
import { handleCorsPreflight, jsonCorsResponse } from "../../../lib/cors";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const OPTIONS: APIRoute = async ({ request }) => handleCorsPreflight(request) ?? new Response(null, { status: 204 });

export const POST: APIRoute = async ({ request, cookies }) => {
  const preflight = handleCorsPreflight(request);
  if (preflight) return preflight;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonCorsResponse(request, { error: "Corps invalide" }, 400);
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return jsonCorsResponse(request, { error: "Identifiants invalides" }, 400);
  }

  const acces = await verifyDiagnosticLogin(result.data.email, result.data.password);
  if (!acces) {
    return jsonCorsResponse(request, { error: "Identifiants incorrects ou expirés" }, 401);
  }

  const token = await createSession({
    email: acces.email,
    role: "diagnostic",
    diagnosticId: acces.id,
  });

  cookies.set("session", token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return jsonCorsResponse(request, {
    success: true,
    nom: acces.nom,
    email: acces.email,
    token,
  });
};
