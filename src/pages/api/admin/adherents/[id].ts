import type { APIRoute } from "astro";
import { z } from "zod";
import { getAdherentById, updateAdherent, deleteAdherent } from "../../../../lib/store";

const updateSchema = z.object({
  prenom: z.string().min(1).max(100).trim().optional(),
  nom: z.string().min(1).max(100).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  motDePasse: z.string().min(6).max(128).optional(),
  telephone: z.string().max(30).optional(),
  entreprise: z.string().max(100).optional(),
  secteur: z.string().max(100).optional(),
  statut: z.enum(["Actif", "Inactif"]).optional(),
  coursInscrits: z.array(z.string()).optional(),
});

export const PUT: APIRoute = async ({ params, request, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const { id } = params;
  if (!id) return new Response(JSON.stringify({ error: "ID manquant" }), { status: 400 });

  if (!await getAdherentById(id)) {
    return new Response(JSON.stringify({ error: "Adhérent introuvable" }), { status: 404 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 }); }

  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error.issues[0].message }), { status: 400 });
  }

  const updated = await updateAdherent(id, result.data);
  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const { id } = params;
  if (!id) return new Response(JSON.stringify({ error: "ID manquant" }), { status: 400 });

  const deleted = await deleteAdherent(id);
  if (!deleted) {
    return new Response(JSON.stringify({ error: "Adhérent introuvable" }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
