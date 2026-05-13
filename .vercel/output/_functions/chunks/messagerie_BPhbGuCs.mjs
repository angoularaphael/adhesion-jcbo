import { m as messageSchema } from './validation_DszOKWxj.mjs';
import { c as checkRateLimit } from './rateLimit_aff6Ika5.mjs';
import { m as markAsRead, i as addMessage } from './store_Bz098f4M.mjs';

const POST = async ({ request, locals }) => {
  if (!locals.session) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  const { allowed } = checkRateLimit(`msg:${locals.session.email}`, 30, 60 * 60 * 1e3);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Trop de messages envoyés" }), { status: 429 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }
  const result = messageSchema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error.errors[0].message }),
      { status: 400 }
    );
  }
  const { conversationId, texte } = result.data;
  const de = locals.session.role === "admin" ? "admin" : "adherent";
  const msg = addMessage(conversationId, texte, de);
  if (!msg) {
    return new Response(JSON.stringify({ error: "Conversation introuvable" }), { status: 404 });
  }
  return new Response(JSON.stringify(msg), {
    status: 201,
    headers: { "Content-Type": "application/json" }
  });
};
const PATCH = async ({ request, locals }) => {
  if (!locals.session) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }
  const { conversationId } = body;
  if (!conversationId) {
    return new Response(JSON.stringify({ error: "ID manquant" }), { status: 400 });
  }
  markAsRead(conversationId);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  PATCH,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
