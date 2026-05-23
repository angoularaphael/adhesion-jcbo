import type { APIRoute } from "astro";
import { getAdminProfil, updateAdminProfil, setAdminPassword } from "../../../lib/store-admin";
import { z } from "zod";

const updateSchema = z.object({
  prenom: z.string().min(1).optional(),
  nom: z.string().min(1).optional(),
  telephone: z.string().optional(),
  photoUrl: z.string().optional(),
});

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  return new Response(JSON.stringify(await getAdminProfil(locals.session.email)), {
    headers: { "Content-Type": "application/json" },
  });
};

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

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.issues[0].message }), { status: 400 });
  }

  const profil = await updateAdminProfil(locals.session.email, parsed.data);
  return new Response(JSON.stringify(profil), { headers: { "Content-Type": "application/json" } });
};

export const PATCH: APIRoute = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const { password } = (await request.json()) as { password?: string };
  if (!password || password.length < 8) {
    return new Response(JSON.stringify({ error: "Mot de passe trop court (min. 8)" }), { status: 400 });
  }

  await setAdminPassword(locals.session.email, password);
  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
};
