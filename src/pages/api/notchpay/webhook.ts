import type { APIRoute } from "astro";
import { getCheckoutPending, fulfillCoursPayment } from "../../../lib/store";
import { verifyPayment } from "../../../lib/notchpay";

export const POST: APIRoute = async ({ request }) => {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return new Response("JSON invalide", { status: 400 });
  }

  const event = String(payload.event ?? "");
  if (event !== "payment.complete") {
    return new Response(JSON.stringify({ ignored: true, event }), { status: 200 });
  }

  const txData = (payload.data ?? payload) as Record<string, unknown>;
  const reference = String(txData.reference ?? txData.trxref ?? "");
  if (!reference) return new Response("Référence manquante", { status: 400 });

  const verified = await verifyPayment(reference);
  if (!verified || verified.status !== "complete") {
    return new Response(JSON.stringify({ error: "Paiement non vérifié" }), { status: 400 });
  }

  const meta = (verified.metadata ?? (txData.metadata ?? txData.custom_fields ?? {})) as Record<string, string>;
  const pending = await getCheckoutPending(reference);

  const adherentEmail = meta.adherentEmail ?? pending?.adherentEmail ?? "";
  const coursIdsStr = meta.coursIds ?? pending?.coursIds ?? "";
  const coursTitres = meta.coursTitres ?? pending?.coursTitres ?? "Formation JCBO";
  const montantEur = Number(meta.montant ?? pending?.montant ?? 0);

  if (!adherentEmail || !coursIdsStr) {
    return new Response(JSON.stringify({ error: "Métadonnées manquantes" }), { status: 400 });
  }

  const paiement = await fulfillCoursPayment({
    adherentEmail,
    coursIds: coursIdsStr.split(",").filter(Boolean),
    coursTitres,
    montant: montantEur,
    provider: "notchpay",
    reference,
  });

  if (!paiement) {
    return new Response(JSON.stringify({ error: "Traitement impossible" }), { status: 500 });
  }

  return new Response(JSON.stringify({ recu: true }), { status: 200 });
};
