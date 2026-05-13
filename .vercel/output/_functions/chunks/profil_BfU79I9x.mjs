import { p as profilSchema } from './validation_DszOKWxj.mjs';
import { c as checkRateLimit } from './rateLimit_aff6Ika5.mjs';
import { b as getProfil, l as updateProfil } from './store_Bz098f4M.mjs';

const GET = async ({ locals }) => {
  if (!locals.session || locals.session.role !== "adherent") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  return new Response(JSON.stringify(getProfil()), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
const PUT = async ({ request, locals, clientAddress }) => {
  if (!locals.session || locals.session.role !== "adherent") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  const { allowed } = checkRateLimit(`profil:${locals.session.email}`, 10, 60 * 60 * 1e3);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Trop de modifications. Réessayez plus tard." }), {
      status: 429
    });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }
  const result = profilSchema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error.errors[0].message, details: result.error.flatten() }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const updated = updateProfil(result.data);
  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
