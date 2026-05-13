import { c as contactSchema } from './validation_DszOKWxj.mjs';
import { c as checkRateLimit } from './rateLimit_aff6Ika5.mjs';
import { h as findOrCreateConversation, i as addMessage } from './store_Bz098f4M.mjs';

const POST = async ({ request, locals }) => {
  if (!locals.session) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  const { allowed } = checkRateLimit(`contact:${locals.session.email}`, 5, 60 * 60 * 1e3);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Vous avez atteint la limite de messages. Réessayez dans 1 heure." }),
      { status: 429 }
    );
  }
  let body;
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
  const { sujet, message } = result.data;
  const conv = findOrCreateConversation(locals.session.email, sujet);
  addMessage(conv.id, `[${sujet}] ${message}`, "adherent");
  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
