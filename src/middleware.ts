import { defineMiddleware } from "astro:middleware";
import { verifySession } from "./lib/session";

const PUBLIC_PATHS = ["/login", "/api/auth/", "/api/stripe/webhook", "/verification/"];

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

  if ((path.startsWith("/adherent") || path.startsWith("/paiement")) && session.role !== "adherent") {
    return context.redirect("/dashboard");
  }

  context.locals.session = session;
  return next();
});
