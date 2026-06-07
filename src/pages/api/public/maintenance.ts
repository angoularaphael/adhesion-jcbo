import type { APIRoute } from "astro";
import { getMaintenanceStatus } from "../../../lib/maintenance";
import { handleCorsPreflight, jsonCorsResponse } from "../../../lib/cors";

export const OPTIONS: APIRoute = async ({ request }) =>
  handleCorsPreflight(request) ?? new Response(null, { status: 204 });

export const GET: APIRoute = async ({ request }) => {
  const preflight = handleCorsPreflight(request);
  if (preflight) return preflight;

  const status = await getMaintenanceStatus();
  return jsonCorsResponse(request, status);
};
