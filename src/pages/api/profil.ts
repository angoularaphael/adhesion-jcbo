import type { APIRoute } from "astro";
import { profilSchema } from "../../lib/validation";
import { checkRateLimit } from "../../lib/rateLimit";
import { updateProfil, getAdherentByEmail } from "../../lib/store";

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.session || locals.session.role !== "adherent") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  const profil = await getAdherentByEmail(locals.session.email);
  if (!profil) return new Response(JSON.stringify({ error: "Introuvable" }), { status: 404 });
  return new Response(JSON.stringify(profil), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const PUT: APIRoute = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "adherent") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const { allowed } = checkRateLimit(`profil:${locals.session.email}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Trop de modifications. Réessayez plus tard." }), { status: 429 });
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
      JSON.stringify({ error: result.error.issues[0].message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const updated = await updateProfil(locals.session.email, result.data);
  if (!updated) return new Response(JSON.stringify({ error: "Profil introuvable" }), { status: 404 });

  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
