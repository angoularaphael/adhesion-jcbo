import type { APIRoute } from "astro";
import { z } from "zod";
import { getConversation, addMessage } from "../../../../lib/store";

const schema = z.object({
  texte: z.string().min(1).max(2000).trim(),
  de: z.enum(["admin", "adherent"]).default("adherent"),
});

export const GET: APIRoute = async ({ params, locals }) => {
  if (!locals.session) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const { id } = params;
  if (!id) return new Response(JSON.stringify({ error: "ID manquant" }), { status: 400 });

  const conv = await getConversation(id);
  if (!conv) return new Response(JSON.stringify({ error: "Conversation introuvable" }), { status: 404 });

  if (locals.session.role === "adherent" && conv.email !== locals.session.email.toLowerCase()) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 403 });
  }

  return new Response(JSON.stringify(conv), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  if (!locals.session) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const { id } = params;
  if (!id) return new Response(JSON.stringify({ error: "ID manquant" }), { status: 400 });

  const conv = await getConversation(id);
  if (!conv) return new Response(JSON.stringify({ error: "Conversation introuvable" }), { status: 404 });

  if (locals.session.role === "adherent" && conv.email !== locals.session.email.toLowerCase()) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 }); }

  const result = schema.safeParse(body);
  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error.issues[0].message }), { status: 400 });
  }

  const de = locals.session.role === "admin" ? "admin" : "adherent";
  const msg = await addMessage(id, result.data.texte, de);

  return new Response(JSON.stringify(msg), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
