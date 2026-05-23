import type { APIRoute } from "astro";
import { z } from "zod";
import { subscribeNewsletter } from "../../lib/store-admin";
import { sendNewsletterConfirmation } from "../../lib/email";
import { handleCorsPreflight, jsonCorsResponse } from "../../lib/cors";

const schema = z.object({ email: z.string().email() });

export const OPTIONS: APIRoute = async ({ request }) => handleCorsPreflight(request) ?? new Response(null, { status: 204 });

export const POST: APIRoute = async ({ request }) => {
  const preflight = handleCorsPreflight(request);
  if (preflight) return preflight;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonCorsResponse(request, { error: "Corps invalide" }, 400);
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return jsonCorsResponse(request, { error: "E-mail invalide" }, 400);
  }

  await subscribeNewsletter(result.data.email);
  await sendNewsletterConfirmation(result.data.email);

  return jsonCorsResponse(request, { success: true });
};
