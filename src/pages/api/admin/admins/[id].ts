import type { APIRoute } from "astro";
import { z } from "zod";
import { requireSuperAdminSession, getSessionEmail } from "../../../../lib/admin-auth";
import {
  getAdminById,
  resetAdminPassword,
  setAdminStatut,
} from "../../../../lib/store-admin";
import { sendCredentialsEmail } from "../../../../lib/email";

const patchSchema = z.object({
  statut: z.enum(["Actif", "Inactif"]).optional(),
  regenererMotDePasse: z.boolean().optional(),
  envoyerEmail: z.boolean().optional(),
});

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const denied = await requireSuperAdminSession(locals);
  if (denied) return denied;

  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "ID manquant" }), { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.issues[0].message }), { status: 400 });
  }

  const admin = await getAdminById(id);
  if (!admin) {
    return new Response(JSON.stringify({ error: "Administrateur introuvable" }), { status: 404 });
  }

  try {
    let motDePasse: string | undefined;
    if (parsed.data.regenererMotDePasse) {
      motDePasse = await resetAdminPassword(id);
      if (parsed.data.envoyerEmail !== false && motDePasse) {
        await sendCredentialsEmail({
          to: admin.email,
          nom: `${admin.prenom} ${admin.nom}`,
          motDePasse,
        });
      }
    }

    let updated = admin;
    if (parsed.data.statut) {
      updated = await setAdminStatut(id, parsed.data.statut, getSessionEmail(locals));
    } else if (parsed.data.regenererMotDePasse) {
      updated = (await getAdminById(id)) ?? admin;
    }

    return new Response(
      JSON.stringify({
        admin: updated,
        motDePasse,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur de mise à jour.";
    return new Response(JSON.stringify({ error: message }), { status: 400 });
  }
};
