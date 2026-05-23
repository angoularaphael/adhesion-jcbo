import type { APIRoute } from "astro";
import { z } from "zod";
import { checkRateLimit } from "../../../lib/rateLimit";
import { verifyAdminLogin, setAdminPasswordForEmail } from "../../../lib/store-admin";
import { getAdherentByEmail, updateProfil } from "../../../lib/store";
import { verifyPassword } from "../../../lib/password";

const schema = z.object({
  ancienMotDePasse: z.string().min(1, "Mot de passe actuel requis"),
  nouveauMotDePasse: z
    .string()
    .min(8, "Le nouveau mot de passe doit faire au moins 8 caractères")
    .max(128)
    .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
    .regex(/[0-9!@#$%^&*]/, "Doit contenir au moins un chiffre ou caractère spécial"),
});

export const PUT: APIRoute = async ({ request, locals }) => {
  if (!locals.session) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const { allowed } = checkRateLimit(`password:${locals.session.email}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Trop de tentatives. Réessayez dans 15 minutes." }), { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error.issues[0].message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { ancienMotDePasse, nouveauMotDePasse } = result.data;

  if (locals.session.role === "admin") {
    const admin = await verifyAdminLogin(locals.session.email, ancienMotDePasse);
    if (!admin) {
      return new Response(JSON.stringify({ error: "Mot de passe actuel incorrect." }), { status: 401 });
    }
    await setAdminPasswordForEmail(locals.session.email, nouveauMotDePasse);
  } else {
    const adherent = await getAdherentByEmail(locals.session.email);
    if (!adherent || !(await verifyPassword(ancienMotDePasse, adherent.motDePasse))) {
      return new Response(JSON.stringify({ error: "Mot de passe actuel incorrect." }), { status: 401 });
    }
    await updateProfil(locals.session.email, { motDePasse: nouveauMotDePasse });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
