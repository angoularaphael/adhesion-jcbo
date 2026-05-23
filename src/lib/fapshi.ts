import { FapshiClient } from "@fapshi/payments";

let client: FapshiClient | null = null;

export function getFapshiClient(): FapshiClient | null {
  const apiUser = import.meta.env.FAPSHI_API_USER;
  const apiKey = import.meta.env.FAPSHI_API_KEY;
  if (!apiUser || !apiKey) return null;
  if (!client) {
    client = new FapshiClient({
      apiUser,
      apiKey,
      environment: apiKey.includes("sandbox") || import.meta.env.FAPSHI_ENV === "sandbox" ? "sandbox" : "live",
    });
  }
  return client;
}
