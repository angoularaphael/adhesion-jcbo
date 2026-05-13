import { l as loginSchema } from './validation_DszOKWxj.mjs';
import { i as isBlacklisted, c as checkRateLimit, r as resetRateLimit } from './rateLimit_aff6Ika5.mjs';
import { c as createSession } from './session_Bm75UjNr.mjs';
import { a as mockAdmin, m as mockAdherent } from './mock_DQYpfraV.mjs';

const POST = async ({ request, cookies, clientAddress }) => {
  const ip = clientAddress || "unknown";
  if (isBlacklisted(ip)) {
    return new Response(JSON.stringify({ error: "Accès refusé." }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }
  const { allowed, remaining, retryAfterMs } = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1e3);
  if (!allowed) {
    const minutes = Math.ceil(retryAfterMs / 6e4);
    return new Response(
      JSON.stringify({ error: `Trop de tentatives. Réessayez dans ${minutes} minute(s).` }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(retryAfterMs / 1e3)),
          "X-RateLimit-Remaining": "0"
        }
      }
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps de requête invalide." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error.errors[0].message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const { email, password } = result.data;
  if (isBlacklisted(email)) {
    return new Response(JSON.stringify({ error: "Accès refusé." }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }
  let role = null;
  if (email === mockAdmin.email.toLowerCase() && password === mockAdmin.motDePasse) {
    role = "admin";
  } else if (email === mockAdherent.email.toLowerCase() && password === mockAdherent.motDePasse) {
    role = "adherent";
  }
  if (!role) {
    return new Response(
      JSON.stringify({
        error: "Identifiants incorrects.",
        remaining
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  resetRateLimit(`login:${ip}`);
  const token = await createSession({ email, role });
  cookies.set("session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/"
  });
  const redirectTo = role === "admin" ? "/dashboard" : "/adherent/tableau-de-bord";
  return new Response(JSON.stringify({ success: true, redirectTo }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
