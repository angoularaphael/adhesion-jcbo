import type { APIRoute } from "astro";
import { coursSchema } from "../../../lib/validation";
import { getCoursById, updateCours, deleteCours } from "../../../lib/store";
import { notifyAdherentsPublishedContent } from "../../../lib/store-admin";

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

  const result = coursSchema.partial().safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error.issues[0].message }),
      { status: 400 }
    );
  }

  const before = await getCoursById(id);
  const updated = await updateCours(id, result.data);
  if (!updated) {
    return new Response(JSON.stringify({ error: "Cours introuvable" }), { status: 404 });
  }

  if (updated.statut === "Publié" && before?.statut !== "Publié") {
    void notifyAdherentsPublishedContent({
      type: "cours",
      titre: "Nouveau cours",
      message: `Un nouveau cours est disponible : « ${updated.titre} ».`,
      ctaPath: "/adherent/cours",
    });
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

  const deleted = await deleteCours(id);
  if (!deleted) {
    return new Response(JSON.stringify({ error: "Cours introuvable" }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
