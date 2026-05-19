import type { APIRoute } from "astro";
import { contactSchema } from "../../lib/validation";
import { checkRateLimit } from "../../lib/rateLimit";
import { addMessage, findOrCreateConversation } from "../../lib/store";

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const { allowed } = checkRateLimit(`contact:${locals.session.email}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Vous avez atteint la limite de messages. Réessayez dans 1 heure." }),
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error.issues[0].message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { sujet, message } = result.data;
  const conv = await findOrCreateConversation(locals.session.email, sujet);
  await addMessage(conv.id, `[${sujet}] ${message}`, "adherent");

  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
