import type { APIRoute } from "astro";
import { loginSchema } from "../../../lib/validation";
import { checkRateLimit, resetRateLimit, isBlacklisted } from "../../../lib/rateLimit";
import { createSession } from "../../../lib/session";
import { verifyAdminLogin } from "../../../lib/store-admin";
import { getAdherentByEmail } from "../../../lib/store";
import { verifyPassword } from "../../../lib/password";

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const ip = clientAddress || "unknown";

  if (isBlacklisted(ip)) {
    return new Response(JSON.stringify({ error: "Accès refusé." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps de requête invalide." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error.issues[0].message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { email, password } = result.data;
  const emailLower = email.toLowerCase();

  if (isBlacklisted(emailLower)) {
    return new Response(JSON.stringify({ error: "Accès refusé." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  let role: "admin" | "adherent" | null = null;
  let adminId: string | undefined;
  let adminRole: "super_admin" | "admin" | undefined;

  const admin = await verifyAdminLogin(emailLower, password);
  if (admin) {
    role = "admin";
    adminId = admin.id;
    adminRole = admin.role;
  } else {
    const adherent = await getAdherentByEmail(emailLower);
    if (adherent && adherent.statut === "Actif" && (await verifyPassword(password, adherent.motDePasse))) {
      role = "adherent";
    }
  }

  if (!role) {
    return new Response(
      JSON.stringify({ error: "Identifiants incorrects.", remaining }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  resetRateLimit(`login:${ip}`);

  const token = await createSession({
    email: emailLower,
    role,
    ...(role === "admin" ? { adminId, adminRole } : {}),
  });

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
