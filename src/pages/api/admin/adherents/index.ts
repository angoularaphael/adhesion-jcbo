import type { APIRoute } from "astro";
import { z } from "zod";
import { getAdherents, createAdherent } from "../../../../lib/store";

const createSchema = z.object({
  prenom: z.string().min(1).max(100).trim(),
  nom: z.string().min(1).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  motDePasse: z.string().min(6).max(128),
  telephone: z.string().max(30).default(""),
  entreprise: z.string().max(100).default(""),
  secteur: z.string().max(100).default(""),
  statut: z.enum(["Actif", "Inactif"]).default("Actif"),
  coursInscrits: z.array(z.string()).default([]),
});

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  return new Response(JSON.stringify(getAdherents()), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 }); }

  const result = createSchema.safeParse(body);
  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error.errors[0].message }), { status: 400 });
  }

  // Vérifier unicité email
  const existing = getAdherents().find(a => a.email === result.data.email);
  if (existing) {
    return new Response(JSON.stringify({ error: "Cet e-mail est déjà utilisé." }), { status: 409 });
  }

  const item = createAdherent(result.data);
  return new Response(JSON.stringify(item), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
