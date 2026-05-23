import { defineMiddleware } from "astro:middleware";
import { verifySession } from "./lib/session";
import { isSuperAdminEmail } from "./lib/admin-auth";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/",
  "/api/stripe/webhook",
  "/api/fapshi/webhook",
  "/api/public/",
  "/api/diagnostic/login",
  "/api/diagnostic/submit",
  "/api/newsletter",
  "/verification/",
];

export const onRequest = defineMiddleware(async (context, next) => {
  const path = new URL(context.request.url).pathname;

  // Laisser passer les routes publiques
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

  // Contrôle d'accès par rôle
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
