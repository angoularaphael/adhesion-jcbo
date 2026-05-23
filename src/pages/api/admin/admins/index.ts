import type { APIRoute } from "astro";
import { z } from "zod";
import { requireSuperAdminSession, getSessionEmail } from "../../../../lib/admin-auth";
import { createAdminAccount, listManagedAdmins } from "../../../../lib/store-admin";
import { sendCredentialsEmail } from "../../../../lib/email";

const createSchema = z.object({
  email: z.string().email("E-mail invalide"),
  prenom: z.string().min(1, "Prénom requis"),
  nom: z.string().min(1, "Nom requis"),
  telephone: z.string().optional(),
  envoyerEmail: z.boolean().optional(),
});

export const GET: APIRoute = async ({ locals }) => {
  const denied = await requireSuperAdminSession(locals);
  if (denied) return denied;

  const admins = await listManagedAdmins();
  return new Response(JSON.stringify({ admins }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = await requireSuperAdminSession(locals);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.issues[0].message }), { status: 400 });
  }

  try {
    const { admin, motDePasse } = await createAdminAccount(parsed.data, getSessionEmail(locals));

    let emailSent = false;
    let emailError: string | undefined;
    if (parsed.data.envoyerEmail !== false) {
      const result = await sendCredentialsEmail({
        to: admin.email,
        nom: `${admin.prenom} ${admin.nom}`,
        motDePasse,
      });
      emailSent = result.ok;
      emailError = result.ok ? undefined : result.error;
    }

    return new Response(
      JSON.stringify({
        admin: {
          id: admin.id,
          email: admin.email,
          prenom: admin.prenom,
          nom: admin.nom,
          role: admin.role,
          statut: admin.statut,
        },
        motDePasse,
        emailSent,
        emailError,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur lors de la création.";
    return new Response(JSON.stringify({ error: message }), { status: 400 });
  }
};
