import type { APIRoute } from "astro";
import { marquerNotificationsLues } from "../../../lib/store";

export const POST: APIRoute = async ({ locals }) => {
  if (!locals.session || locals.session.role !== "adherent") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  await marquerNotificationsLues(locals.session.email);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
