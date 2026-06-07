import type { APIRoute } from "astro";
import { getMaintenanceStatus, setMaintenanceFlag } from "../../../lib/maintenance";
import { z } from "zod";

const patchSchema = z.object({
  site: z.enum(["adherent", "vitrine"]),
  enabled: z.boolean(),
});

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  return new Response(JSON.stringify(await getMaintenanceStatus()), {
    headers: { "Content-Type": "application/json" },
  });
};

export const PATCH: APIRoute = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.issues[0].message }), { status: 400 });
  }

  const status = await setMaintenanceFlag(parsed.data.site, parsed.data.enabled);
  return new Response(JSON.stringify(status), { headers: { "Content-Type": "application/json" } });
};
