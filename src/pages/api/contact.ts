import type { APIRoute } from "astro";
import { contactSchema } from "../../lib/validation";
import { checkRateLimit } from "../../lib/rateLimit";
import { addMessage, getConversations, createActualite } from "../../lib/store";

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  if (!locals.session) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  // Rate limiting : 5 messages / heure par utilisateur
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
      JSON.stringify({ error: result.error.errors[0].message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Trouver ou créer une conversation pour cet adhérent
  const conversations = getConversations();
  let conv = conversations.find(c =>
    locals.session?.role === "adherent"
      ? c.adherent.toLowerCase().includes("marie")
      : false
  );

  if (conv) {
    addMessage(conv.id, `[${result.data.sujet}] ${result.data.message}`, "adherent");
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
