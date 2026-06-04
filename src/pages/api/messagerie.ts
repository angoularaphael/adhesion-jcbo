import type { APIRoute } from "astro";
import { messageSchema } from "../../lib/validation";
import { checkRateLimit } from "../../lib/rateLimit";
import { addMessage, markAsRead, getConversations } from "../../lib/store";

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.session) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  if (locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 403 });
  }

  const conversations = await getConversations();
  return new Response(JSON.stringify(conversations), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const { allowed } = checkRateLimit(`msg:${locals.session.email}`, 30, 60 * 60 * 1000);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Trop de messages envoyés" }), { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const result = messageSchema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error.issues[0].message }),
      { status: 400 }
    );
  }

  const { conversationId, texte } = result.data;
  const de = locals.session.role === "admin" ? "admin" : "adherent";

  const msg = await addMessage(conversationId, texte, de);
  if (!msg) {
    return new Response(JSON.stringify({ error: "Conversation introuvable" }), { status: 404 });
  }

  return new Response(JSON.stringify(msg), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};

export const PATCH: APIRoute = async ({ request, locals }) => {
  if (!locals.session) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const { conversationId } = body as { conversationId: string };
  if (!conversationId) {
    return new Response(JSON.stringify({ error: "ID manquant" }), { status: 400 });
  }

  await markAsRead(conversationId);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
