import { a as actualiteSchema } from './validation_DszOKWxj.mjs';
import { c as checkRateLimit } from './rateLimit_aff6Ika5.mjs';
import { d as getActualites, f as createActualite } from './store_Bz098f4M.mjs';

const GET = async ({ locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  return new Response(JSON.stringify(getActualites()), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
const POST = async ({ request, locals, clientAddress }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  const { allowed } = checkRateLimit(`actualites:${clientAddress}`, 30, 60 * 60 * 1e3);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Trop de requêtes" }), { status: 429 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }
  const result = actualiteSchema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error.errors[0].message, details: result.error.flatten() }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const item = createActualite(result.data);
  return new Response(JSON.stringify(item), {
    status: 201,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
