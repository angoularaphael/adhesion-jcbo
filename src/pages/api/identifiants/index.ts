import type { APIRoute } from "astro";
import { identifiantSchema } from "../../../lib/validation";
import { checkRateLimit, isBlacklisted } from "../../../lib/rateLimit";
import { getIdentifiants, createIdentifiant, toggleIdentifiantStatut, resetMotDePasse } from "../../../lib/store";
import { sendCredentialsEmail } from "../../../lib/email";

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  return new Response(JSON.stringify(getIdentifiants()), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const { allowed } = checkRateLimit(`identifiants:${clientAddress}`, 20, 60 * 60 * 1000);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Trop de requêtes" }), { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const result = identifiantSchema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error.errors[0].message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (isBlacklisted(result.data.email)) {
    return new Response(JSON.stringify({ error: "E-mail non autorisé" }), { status: 400 });
  }

  const item = createIdentifiant(result.data);

  const emailResult = await sendCredentialsEmail({
    to: item.email,
    nom: item.nom,
    motDePasse: item.motDePasse,
  });

  return new Response(
    JSON.stringify({
      id: item.id,
      email: item.email,
      nom: item.nom,
      emailSent: emailResult.ok,
      emailError: emailResult.ok ? undefined : emailResult.error,
    }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
};

// Régénérer les identifiants d'un adhérent existant
export const PUT: APIRoute = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const { id } = body as { id: string };
  if (!id) {
    return new Response(JSON.stringify({ error: "ID manquant" }), { status: 400 });
  }

  const reset = resetMotDePasse(id);
  if (!reset) {
    return new Response(JSON.stringify({ error: "Adhérent introuvable" }), { status: 404 });
  }

  const emailResult = await sendCredentialsEmail({
    to: reset.email,
    nom: reset.nom,
    motDePasse: reset.motDePasse,
    isReset: true,
  });

  return new Response(
    JSON.stringify({ emailSent: emailResult.ok, emailError: emailResult.ok ? undefined : emailResult.error }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};

export const PATCH: APIRoute = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const { id } = body as { id: string };
  if (!id) {
    return new Response(JSON.stringify({ error: "ID manquant" }), { status: 400 });
  }

  const updated = toggleIdentifiantStatut(id);
  if (!updated) {
    return new Response(JSON.stringify({ error: "Identifiant introuvable" }), { status: 404 });
  }

  return new Response(JSON.stringify(updated), { status: 200 });
};
