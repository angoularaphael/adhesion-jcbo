import type { APIRoute } from "astro";
import { profilSchema } from "../../lib/validation";
import { checkRateLimit } from "../../lib/rateLimit";
import { updateProfil, getProfil } from "../../lib/store";

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.session || locals.session.role !== "adherent") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  return new Response(JSON.stringify(getProfil()), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const PUT: APIRoute = async ({ request, locals, clientAddress }) => {
  if (!locals.session || locals.session.role !== "adherent") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const { allowed } = checkRateLimit(`profil:${locals.session.email}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Trop de modifications. Réessayez plus tard." }), {
      status: 429,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const result = profilSchema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error.errors[0].message, details: result.error.flatten() }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const updated = updateProfil(result.data);
  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
