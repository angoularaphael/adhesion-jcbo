import type { APIRoute } from "astro";
import { getCours, getAdherentByEmail, saveCheckoutPending, addNotification } from "../../../lib/store";
import { getNotchPayConfig, createPayment } from "../../../lib/notchpay";
import { splitPaymentAmount } from "../../../lib/payment-split";

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "adherent") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const config = getNotchPayConfig();
  if (!config) {
    return new Response(JSON.stringify({ error: "Paiement Mobile Money non configuré (NotchPay)" }), { status: 503 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 }); }

  const { coursId, coursIds } = body as { coursId?: string; coursIds?: string[] };
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

  const coursSansPrix = finalCours.filter(c => !c.prix || c.prix <= 0);
  if (coursSansPrix.length > 0) {
    return new Response(
      JSON.stringify({ error: "Certaines formations n'ont pas de prix défini. Contactez l'administration." }),
      { status: 400 }
    );
  }

  const amountEur = finalCours.reduce((sum, c) => sum + (c.prix ?? 0), 0);
  const amountXaf = Math.max(100, Math.round(amountEur * 655));
  const label = finalCours.length === 1 ? finalCours[0].titre : `${finalCours.length} formations JCBO`;
  const reference = `jcbo-${adherent.id}-${Date.now()}`;
  const coursIdsStr = finalCours.map(c => c.id).join(",");
  const coursTitres = finalCours.map(c => c.titre).join(" | ");
  const metadata = {
    adherentEmail: adherent.email,
    type: "cours_multiple",
    coursIds: coursIdsStr,
    coursTitres,
    montant: String(amountEur),
  };

  await saveCheckoutPending({
    reference,
    adherentEmail: adherent.email,
    coursIds: coursIdsStr,
    coursTitres,
    montant: amountEur,
    provider: "notchpay",
  });

  await addNotification({
    adherentEmail: adherent.email,
    type: "paiement",
    titre: "Paiement en cours",
    message: `Finalisez votre paiement de ${amountEur} € pour « ${label} » sur la page sécurisée Mobile Money (NotchPay).`,
  });

  const { platformAmount: applicationFee, connectedAmount: destinationAmount } = splitPaymentAmount(amountXaf);

  try {
    const payment = await createPayment({
      amount: amountXaf,
      currency: "XAF",
      email: adherent.email,
      name: `${adherent.prenom} ${adherent.nom}`,
      description: label,
      reference,
      callbackUrl: `${origin}/paiement/succes?provider=notchpay`,
      metadata,
      applicationFee,
      destinationAccount: config.connectedAccountId,
      destinationAmount,
    });

    if (!payment || !payment.authorization_url) {
      return new Response(JSON.stringify({ error: "Impossible d'initialiser le paiement" }), { status: 502 });
    }

    return new Response(
      JSON.stringify({ url: payment.authorization_url, reference: payment.reference }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur NotchPay";
    return new Response(JSON.stringify({ error: msg }), { status: 502 });
  }
};
