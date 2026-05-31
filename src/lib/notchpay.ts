const BASE_URL = "https://api.notchpay.co";

export interface NotchPayConfig {
  publicKey: string;
  secretKey?: string;
  connectedAccountId?: string;
}

function getConfig(): NotchPayConfig | null {
  const publicKey = import.meta.env.NOTCHPAY_PUBLIC_KEY;
  if (!publicKey) return null;
  return {
    publicKey,
    secretKey: import.meta.env.NOTCHPAY_SECRET_KEY,
    connectedAccountId: import.meta.env.NOTCHPAY_CONNECTED_ACCOUNT_ID,
  };
}

export function getNotchPayConfig(): NotchPayConfig | null {
  return getConfig();
}

export async function createPayment(params: {
  amount: number;
  currency: string;
  email: string;
  name: string;
  description: string;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, string>;
  applicationFee?: number;
  destinationAccount?: string;
  destinationAmount?: number;
}): Promise<{ authorization_url: string; reference: string } | null> {
  const config = getConfig();
  if (!config) return null;

  const body: Record<string, unknown> = {
    amount: params.amount,
    currency: params.currency,
    customer: {
      name: params.name,
      email: params.email,
    },
    description: params.description,
    reference: params.reference,
    callback: params.callbackUrl,
  };

  if (params.metadata && Object.keys(params.metadata).length > 0) {
    body.metadata = params.metadata;
  }

  // Split 80 % plateforme (principal) / 20 % compte connecté (NotchPay Sync)
  if (params.applicationFee != null && params.destinationAccount) {
    body.application_fee = params.applicationFee;
    body.destination = {
      account: params.destinationAccount,
      amount: params.destinationAmount ?? params.amount - params.applicationFee,
    };
  }

  const res = await fetch(`${BASE_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": config.publicKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`NotchPay init error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return {
    authorization_url: data.authorization_url ?? data.transaction?.authorization_url ?? "",
    reference: data.transaction?.reference ?? params.reference,
  };
}

export async function verifyPayment(reference: string): Promise<{
  status: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
} | null> {
  const config = getConfig();
  if (!config) return null;

  const res = await fetch(`${BASE_URL}/payments/${reference}`, {
    method: "GET",
    headers: {
      "Authorization": config.publicKey,
    },
  });

  if (!res.ok) return null;

  const data = await res.json();
  const tx = data.transaction ?? data;
  return {
    status: tx.status ?? "",
    amount: tx.amount ?? 0,
    currency: tx.currency ?? "XAF",
    metadata: tx.metadata,
  };
}
