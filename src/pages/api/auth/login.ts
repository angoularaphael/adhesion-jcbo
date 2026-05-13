import type { APIRoute } from "astro";
import { loginSchema } from "../../../lib/validation";
import { checkRateLimit, resetRateLimit, isBlacklisted } from "../../../lib/rateLimit";
import { createSession } from "../../../lib/session";
import { mockAdmin, mockAdherent } from "../../../data/mock";

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const ip = clientAddress || "unknown";

  // Vérification blacklist IP
  if (isBlacklisted(ip)) {
    return new Response(JSON.stringify({ error: "Accès refusé." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Rate limiting : 5 tentatives / 15 min par IP
  const { allowed, remaining, retryAfterMs } = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    const minutes = Math.ceil(retryAfterMs / 60000);
    return new Response(
      JSON.stringify({ error: `Trop de tentatives. Réessayez dans ${minutes} minute(s).` }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Parsing du body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps de requête invalide." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validation Zod
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error.errors[0].message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { email, password } = result.data;

  // Vérification blacklist email
  if (isBlacklisted(email)) {
    return new Response(JSON.stringify({ error: "Accès refusé." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Vérification des identifiants
  let role: "admin" | "adherent" | null = null;

  if (email === mockAdmin.email.toLowerCase() && password === mockAdmin.motDePasse) {
    role = "admin";
  } else if (email === mockAdherent.email.toLowerCase() && password === mockAdherent.motDePasse) {
    role = "adherent";
  }

  if (!role) {
    return new Response(
      JSON.stringify({
        error: "Identifiants incorrects.",
        remaining,
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Succès — réinitialiser le rate limit
  resetRateLimit(`login:${ip}`);

  // Créer la session JWT
  const token = await createSession({ email, role });

  cookies.set("session", token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  const redirectTo = role === "admin" ? "/dashboard" : "/adherent/tableau-de-bord";

  return new Response(JSON.stringify({ success: true, redirectTo }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
