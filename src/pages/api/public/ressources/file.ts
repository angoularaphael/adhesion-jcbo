import type { APIRoute } from "astro";
import { getRessource } from "../../../../lib/store";
import { getRessourceFileAttachment } from "../../../../lib/ressource-fichier";
import { verifyResourceDownloadToken } from "../../../../lib/resource-download-token";

export const GET: APIRoute = async ({ url }) => {
  const token = url.searchParams.get("token");
  if (!token) return new Response("Lien invalide", { status: 400 });

  const payload = await verifyResourceDownloadToken(token);
  if (!payload) return new Response("Lien expiré ou invalide", { status: 403 });

  const ressource = await getRessource(payload.resourceId);
  if (!ressource) return new Response("Ressource introuvable", { status: 404 });

  const attachment = await getRessourceFileAttachment(ressource);
  if (!attachment) return new Response("Fichier indisponible", { status: 404 });

  const titreSafe = String(ressource.titre ?? "ressource")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 60);
  const ext = attachment.fileName.includes(".")
    ? attachment.fileName.slice(attachment.fileName.lastIndexOf("."))
    : "";
  const filename = attachment.fileName || `${titreSafe}${ext}`;

  return new Response(attachment.buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(attachment.buffer.length),
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
