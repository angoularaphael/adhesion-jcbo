import type { APIRoute } from "astro";
import { progressionSchema } from "../../lib/validation";
import { getProgressions, marquerModuleTermine } from "../../lib/store";

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.session) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  if (locals.session.role === "admin") {
    const email = url.searchParams.get("email");
    return new Response(JSON.stringify(getProgressions(email ?? undefined)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(getProgressions(locals.session.email)), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "adherent") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const result = progressionSchema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error.errors[0].message }),
      { status: 400 }
    );
  }

  const updated = marquerModuleTermine(locals.session.email, result.data.coursId, result.data.moduleId);
  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
