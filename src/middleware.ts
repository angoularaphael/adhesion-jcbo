import { defineMiddleware } from "astro:middleware";
import { verifySession, createSession } from "./lib/session";
import { isSuperAdminEmail } from "./lib/admin-auth";
import { getMaintenanceStatus } from "./lib/maintenance";

const PUBLIC_PATHS = [
  "/login",
  "/maintenance",
  // ⚠ NE PAS mettre tout "/api/auth/" : password.ts a besoin de la session.
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/register",
  "/api/stripe/webhook",
  "/api/notchpay/webhook",
  "/api/public/",
  "/api/diagnostic/login",
  "/api/diagnostic/submit",
  "/api/newsletter",
  "/verification/",
];

const ADHERENT_MAINTENANCE_ALLOW = [
  "/login",
  "/maintenance",
  "/dashboard",
  "/api/admin/maintenance",
  "/api/auth/",
  "/api/public/",
  "/api/stripe/webhook",
  "/api/notchpay/webhook",
];

// 24h en secondes — durée d'inactivité maximale autorisée
const SESSION_MAX_AGE_S = 60 * 60 * 24;
// On rafraîchit la session si elle a été émise il y a plus d'1h (pour limiter le coût)
const REFRESH_THRESHOLD_S = 60 * 60;

export const onRequest = defineMiddleware(async (context, next) => {
  const path = new URL(context.request.url).pathname;

  const maintenance = await getMaintenanceStatus();
  if (maintenance.adherent) {
    const allowedDuringMaintenance = ADHERENT_MAINTENANCE_ALLOW.some((p) => path.startsWith(p));
    if (!allowedDuringMaintenance) {
      const token = context.cookies.get("session")?.value;
      const session = token ? await verifySession(token) : null;
      if (session?.role === "admin") {
        // Les administrateurs conservent l'accès complet.
      } else if (path.startsWith("/api/")) {
        return new Response(JSON.stringify({ error: "Site en maintenance." }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return context.redirect("/maintenance");
      }
    }
  }

  if (PUBLIC_PATHS.some(p => path.startsWith(p))) {
    return next();
  }

  const token = context.cookies.get("session")?.value;

  if (!token) {
    return context.redirect("/login");
  }

  const session = await verifySession(token);

  if (!session) {
    context.cookies.delete("session", { path: "/" });
    return context.redirect("/login");
  }

  // ── Session glissante : on prolonge la session si le token a + d'1h.
  // Toute action de l'adhérent (navigation, API call) repousse l'expiration.
  // Si l'utilisateur reste inactif 24h, le token expirera naturellement.
  const nowS = Math.floor(Date.now() / 1000);
  const iat = (session as unknown as { iat?: number }).iat ?? 0;
  if (!iat || nowS - iat > REFRESH_THRESHOLD_S) {
    const fresh = await createSession({
      email: session.email,
      role: session.role,
      ...(session.diagnosticId ? { diagnosticId: session.diagnosticId } : {}),
      ...(session.adminId ? { adminId: session.adminId } : {}),
      ...(session.adminRole ? { adminRole: session.adminRole } : {}),
    });
    context.cookies.set("session", fresh, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE_S,
      path: "/",
    });
  }

  if (path.startsWith("/dashboard") && session.role !== "admin") {
    return context.redirect("/adherent/tableau-de-bord");
  }

  const superAdminOnly =
    path.startsWith("/dashboard/admins") || path.startsWith("/api/admin/admins");
  if (superAdminOnly && session.role === "admin") {
    const allowed = await isSuperAdminEmail(session.email);
    if (!allowed) {
      if (path.startsWith("/api/")) {
        return new Response(JSON.stringify({ error: "Accès réservé au super administrateur." }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
      return context.redirect("/dashboard");
    }
  }

  if ((path.startsWith("/adherent") || path.startsWith("/paiement")) && session.role !== "adherent") {
    return context.redirect("/dashboard");
  }

  context.locals.session = session;
  return next();
});
