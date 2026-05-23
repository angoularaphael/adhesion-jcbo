import type { APIRoute } from "astro";
import { getCours, getAdherentByEmail } from "../../../lib/store";
import { getFapshiClient } from "../../../lib/fapshi";

const PLANS: Record<string, number> = { Standard: 49, Premium: 99 };

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "adherent") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const fapshi = getFapshiClient();
  if (!fapshi) {
    return new Response(JSON.stringify({ error: "Paiement OM/MoMo non configuré" }), { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const { coursId, planNom, phone } = body as { coursId?: string; planNom?: string; phone?: string };
  const adherent = await getAdherentByEmail(locals.session.email);
  if (!adherent) return new Response(JSON.stringify({ error: "Adhérent introuvable" }), { status: 404 });

  const origin = import.meta.env.PUBLIC_ADHESION_URL ?? new URL(request.url).origin;
  let amount = 0;
  let label = "";
  let externalId = "";
  const meta: Record<string, string> = {
    adherentEmail: adherent.email,
    type: coursId ? "formation" : "abonnement",
  };

  if (planNom) {
    amount = PLANS[planNom];
    if (!amount) return new Response(JSON.stringify({ error: "Plan invalide" }), { status: 400 });
    label = `Abonnement ${planNom}`;
    externalId = `abo-${adherent.id}-${planNom}`;
    meta.planNom = planNom;
    meta.montant = String(amount);
  } else if (coursId) {
    const cours = (await getCours()).find((c) => c.id === coursId);
    if (!cours?.prix) return new Response(JSON.stringify({ error: "Formation introuvable" }), { status: 404 });
    amount = cours.prix;
    label = cours.titre;
    externalId = `cours-${adherent.id}-${coursId}`;
    meta.coursId = coursId;
    meta.coursTitre = cours.titre;
    meta.montant = String(amount);
  } else {
    return new Response(JSON.stringify({ error: "coursId ou planNom requis" }), { status: 400 });
  }

  const amountXaf = Math.max(100, Math.round(amount * 655));

  try {
    const payment = phone
      ? await fapshi.directPay({
          amount: amountXaf,
          phone,
          medium: "mobile money",
          email: adherent.email,
          name: `${adherent.prenom} ${adherent.nom}`,
          externalId,
          message: label,
        })
      : await fapshi.initiatePay({
          amount: amountXaf,
          email: adherent.email,
          redirectUrl: `${origin}/adherent/paiements?fapshi=1`,
          externalId,
          message: label,
        });

    return new Response(
      JSON.stringify({
        url: (payment as { link?: string }).link,
        transactionId: (payment as { transId?: string }).transId,
        externalId,
        meta,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur Fapshi";
    return new Response(JSON.stringify({ error: msg }), { status: 502 });
  }
};
