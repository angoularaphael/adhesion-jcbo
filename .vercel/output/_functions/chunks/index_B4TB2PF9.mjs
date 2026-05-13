import { i as identifiantSchema } from './validation_DszOKWxj.mjs';
import { c as checkRateLimit, i as isBlacklisted } from './rateLimit_aff6Ika5.mjs';
import { j as getIdentifiants, t as toggleIdentifiantStatut, k as createIdentifiant } from './store_Bz098f4M.mjs';

const GET = async ({ locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  return new Response(JSON.stringify(getIdentifiants()), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
const POST = async ({ request, locals, clientAddress }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  const { allowed } = checkRateLimit(`identifiants:${clientAddress}`, 20, 60 * 60 * 1e3);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Trop de requêtes" }), { status: 429 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }
  const result = identifiantSchema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error.errors[0].message, details: result.error.flatten() }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  if (isBlacklisted(result.data.email)) {
    return new Response(JSON.stringify({ error: "E-mail non autorisé" }), { status: 400 });
  }
  const item = createIdentifiant(result.data);
  return new Response(JSON.stringify(item), {
    status: 201,
    headers: { "Content-Type": "application/json" }
  });
};
const PATCH = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }
  const { id } = body;
  if (!id) {
    return new Response(JSON.stringify({ error: "ID manquant" }), { status: 400 });
  }
  const updated = toggleIdentifiantStatut(id);
  if (!updated) {
    return new Response(JSON.stringify({ error: "Identifiant introuvable" }), { status: 404 });
  }
  return new Response(JSON.stringify(updated), { status: 200 });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  PATCH,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
