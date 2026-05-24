import type { APIRoute } from "astro";
import { markAllAdminNotificationsLues } from "../../../../lib/store-admin";

export const POST: APIRoute = async ({ locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  try {
    await markAllAdminNotificationsLues();
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Erreur lors du marquage.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
