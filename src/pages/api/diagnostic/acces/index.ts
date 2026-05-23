import type { APIRoute } from "astro";
import { z } from "zod";
import { createDiagnosticAcces, getDiagnosticAccesList } from "../../../../lib/store-admin";
import { sendDiagnosticCredentialsEmail } from "../../../../lib/email";

const schema = z.object({
  email: z.string().email(),
  nom: z.string().optional(),
});

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  return new Response(JSON.stringify(await getDiagnosticAccesList()), {
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error.issues[0].message }), { status: 400 });
  }

  const { acces, motDePasse } = await createDiagnosticAcces(result.data.email, result.data.nom);
  const diagnosticUrl =
    import.meta.env.PUBLIC_DIAGNOSTIC_URL ?? "https://jcbo-conseil-diagnostic.vercel.app";

  const emailResult = await sendDiagnosticCredentialsEmail({
    to: result.data.email,
    nom: acces.nom,
    motDePasse,
    loginUrl: `${diagnosticUrl}/login`,
  });

  return new Response(
    JSON.stringify({
      id: acces.id,
      email: acces.email,
      nom: acces.nom,
      emailSent: emailResult.ok,
      emailError: emailResult.ok ? undefined : emailResult.error,
    }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
};
