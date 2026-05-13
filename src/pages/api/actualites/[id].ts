import type { APIRoute } from "astro";
import { actualiteSchema } from "../../../lib/validation";
import { updateActualite, deleteActualite } from "../../../lib/store";

export const PUT: APIRoute = async ({ request, locals, params }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: "ID manquant" }), { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const result = actualiteSchema.partial().safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error.errors[0].message }),
      { status: 400 }
    );
  }

  const updated = updateActualite(id, result.data);
  if (!updated) {
    return new Response(JSON.stringify({ error: "Actualité introuvable" }), { status: 404 });
  }

  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: "ID manquant" }), { status: 400 });
  }

  const deleted = deleteActualite(id);
  if (!deleted) {
    return new Response(JSON.stringify({ error: "Actualité introuvable" }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
