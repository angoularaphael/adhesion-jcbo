import type { APIRoute } from "astro";
import { z } from "zod";
import { checkRateLimit } from "../../../lib/rateLimit";
import { updateProfil } from "../../../lib/store";

const bodySchema = z.object({
  photoUrl: z
    .string()
    .url("URL de l'image invalide")
    .max(500, "URL trop longue")
    .nullable()
    .optional(),
});

export const PUT: APIRoute = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "adherent") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const { allowed } = checkRateLimit(`profil-photo:${locals.session.email}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Trop de modifications. Réessayez plus tard." }), { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.issues[0].message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const updated = await updateProfil(locals.session.email, {
    photoUrl: parsed.data.photoUrl ?? "",
  });

  if (!updated) {
    return new Response(JSON.stringify({ error: "Profil introuvable" }), { status: 404 });
  }

  return new Response(JSON.stringify({ photoUrl: updated.photoUrl }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
