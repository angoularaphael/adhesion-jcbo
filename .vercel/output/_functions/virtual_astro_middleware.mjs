import { a8 as defineMiddleware, ai as sequence } from './chunks/sequence_CDEARiL7.mjs';
import 'piccolore';
import 'clsx';
import { v as verifySession } from './chunks/session_Bm75UjNr.mjs';

const PUBLIC_PATHS = ["/login", "/api/auth/login"];
const onRequest$1 = defineMiddleware(async (context, next) => {
  const path = new URL(context.request.url).pathname;
  if (PUBLIC_PATHS.some((p) => path.startsWith(p))) {
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
  if (path.startsWith("/dashboard") && session.role !== "admin") {
    return context.redirect("/adherent/tableau-de-bord");
  }
  if (path.startsWith("/adherent") && session.role !== "adherent") {
    return context.redirect("/dashboard");
  }
  context.locals.session = session;
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
