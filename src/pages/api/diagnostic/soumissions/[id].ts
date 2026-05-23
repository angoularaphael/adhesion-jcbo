import type { APIRoute } from "astro";
import { markDiagnosticLu } from "../../../../lib/store-admin";

export const PATCH: APIRoute = async ({ params, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  const id = params.id;
  if (!id) return new Response(JSON.stringify({ error: "ID requis" }), { status: 400 });
  await markDiagnosticLu(id);
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
