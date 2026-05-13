import type { APIRoute } from "astro";
import { z } from "zod";
import { getAdherentById, findOrCreateConversation, addMessage } from "../../../../../lib/store";

const schema = z.object({
  texte: z.string().min(1).max(2000).trim(),
});

export const POST: APIRoute = async ({ params, request, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const { id } = params;
  if (!id) return new Response(JSON.stringify({ error: "ID manquant" }), { status: 400 });

  const adherent = getAdherentById(id);
  if (!adherent) {
    return new Response(JSON.stringify({ error: "Adhérent introuvable" }), { status: 404 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 }); }

  const result = schema.safeParse(body);
  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error.errors[0].message }), { status: 400 });
  }

  const conv = findOrCreateConversation(adherent.email, "Rappel de paiement");
  const msg = addMessage(conv.id, result.data.texte, "admin");

  return new Response(JSON.stringify({ success: true, conversationId: conv.id, message: msg }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
