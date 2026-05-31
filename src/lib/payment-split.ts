/** Part du compte principal JCBO (plateforme) */
export const PLATFORM_SHARE = 0.8;
/** Part du compte connecté secondaire (partenaire / formateur) */
export const CONNECTED_SHARE = 0.2;

/** Répartition en centimes (Stripe) ou unité entière (XAF NotchPay). */
export function splitPaymentAmount(totalMinorUnits: number): {
  platformAmount: number;
  connectedAmount: number;
} {
  const platformAmount = Math.round(totalMinorUnits * PLATFORM_SHARE);
  const connectedAmount = totalMinorUnits - platformAmount;
  return { platformAmount, connectedAmount };
}
