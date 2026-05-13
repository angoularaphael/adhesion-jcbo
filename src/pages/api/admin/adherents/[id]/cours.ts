import type { APIRoute } from "astro";
import { z } from "zod";
import { getAdherentById, setCoursAdherent } from "../../../../../lib/store";

const schema = z.object({
  coursInscrits: z.array(z.string()),
});

export const PUT: APIRoute = async ({ params, request, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const { id } = params;
  if (!id) return new Response(JSON.stringify({ error: "ID manquant" }), { status: 400 });

  if (!getAdherentById(id)) {
    return new Response(JSON.stringify({ error: "Adhérent introuvable" }), { status: 404 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 }); }

  const result = schema.safeParse(body);
  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error.errors[0].message }), { status: 400 });
  }

  const updated = setCoursAdherent(id, result.data.coursInscrits);
  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
