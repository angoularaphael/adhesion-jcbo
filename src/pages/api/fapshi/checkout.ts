import type { APIRoute } from "astro";
import { getCours, getAdherentByEmail } from "../../../lib/store";
import { getFapshiClient } from "../../../lib/fapshi";

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

  const { coursId, coursIds, phone } = body as { coursId?: string; coursIds?: string[]; phone?: string };
  const adherent = await getAdherentByEmail(locals.session.email);
  if (!adherent) return new Response(JSON.stringify({ error: "Adhérent introuvable" }), { status: 404 });

  const origin = import.meta.env.PUBLIC_ADHESION_URL ?? new URL(request.url).origin;

  const idsToProcess = coursIds ?? (coursId ? [coursId] : []);
  if (idsToProcess.length === 0) {
    return new Response(JSON.stringify({ error: "coursId ou coursIds requis" }), { status: 400 });
  }

  const allCours = await getCours();
  const coursToCheckout = idsToProcess
    .map(id => allCours.find(c => c.id === id && c.statut === "Publié"))
    .filter(Boolean) as (typeof allCours)[number][];

  if (coursToCheckout.length === 0) {
    return new Response(JSON.stringify({ error: "Aucune formation valide trouvée" }), { status: 404 });
  }

  const finalCours = coursToCheckout.filter(c => !adherent.coursInscrits.includes(c.id));
  if (finalCours.length === 0) {
    return new Response(JSON.stringify({ error: "Vous êtes déjà inscrit à toutes ces formations" }), { status: 409 });
  }

  const amount = finalCours.reduce((sum, c) => sum + ((c as typeof c & { prix?: number }).prix ?? 0), 0);
  const label = finalCours.length === 1 ? finalCours[0].titre : `${finalCours.length} formations JCBO`;
  const externalId = `cours-${adherent.id}-${Date.now()}`;

  const meta: Record<string, string> = {
    adherentEmail: adherent.email,
    type: "cours_multiple",
    coursIds: finalCours.map(c => c.id).join(","),
    coursTitres: finalCours.map(c => c.titre).join(" | "),
    montant: String(amount),
  };

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
