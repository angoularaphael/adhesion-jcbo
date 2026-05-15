import type { APIRoute } from "astro";
import { z } from "zod";
import { checkRateLimit } from "../../../lib/rateLimit";
import { createSession } from "../../../lib/session";
import { getAdherentByEmail, createAdherent } from "../../../lib/store";

const schema = z.object({
  prenom: z.string().min(1).max(100).trim(),
  nom: z.string().min(1).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  motDePasse: z.string().min(6).max(128),
  entreprise: z.string().max(100).trim().default(""),
  secteur: z.string().max(100).trim().default(""),
  telephone: z.string().max(30).trim().default(""),
});

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const ip = clientAddress || "unknown";
  const { allowed } = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Trop de tentatives. Réessayez dans 1 heure." }), { status: 429 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 }); }

  const result = schema.safeParse(body);
  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error.errors[0].message }), { status: 400 });
  }

  const { prenom, nom, email, motDePasse, entreprise, secteur, telephone } = result.data;

  if (getAdherentByEmail(email)) {
    return new Response(JSON.stringify({ error: "Un compte avec cet e-mail existe déjà." }), { status: 409 });
  }

  createAdherent({
    prenom, nom, email, motDePasse,
    telephone, entreprise, secteur,
    statut: "Actif",
    coursInscrits: [],
    abonnement: null,
  });

  const token = await createSession({ email, role: "adherent" });
  cookies.set("session", token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return new Response(JSON.stringify({ success: true, redirectTo: "/adherent/tableau-de-bord" }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
