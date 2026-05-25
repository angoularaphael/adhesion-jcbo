import type { APIRoute } from "astro";
import { getRessource } from "../../../../lib/store";
import { isSupabaseFileRef, parseSupabaseFileRef } from "../../../../lib/module-fichier";
import { downloadStorageFile } from "../../../../lib/storage";

/**
 * Sert le fichier d'une ressource en `inline` (consultation in-app, pas téléchargement local).
 */
export const GET: APIRoute = async ({ params, locals }) => {
  if (!locals.session) return new Response("Non autorisé", { status: 401 });

  const id = params.id;
  if (!id) return new Response("ID requis", { status: 400 });

  const ressource = await getRessource(id);
  if (!ressource) return new Response("Ressource introuvable", { status: 404 });

  const fichier = ressource.fichier as string | undefined;
  if (!fichier || fichier === "#") {
    return new Response("Aucun fichier", { status: 404 });
  }

  const titreSafe = String(ressource.titre ?? "ressource").replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 60);

  // Référence Supabase Storage
  if (isSupabaseFileRef(fichier) || fichier.includes("/storage/v1/object/public/")) {
    const ref = parseSupabaseFileRef(fichier);
    if (!ref) return new Response("Référence invalide", { status: 404 });

    const dl = await downloadStorageFile(
      ref.bucket as "cours-fichiers" | "ressources-vitrine",
      ref.path
    );
    if ("error" in dl) {
      return new Response("Le fichier n'a pas pu être chargé.", { status: 502 });
    }
    const ext = ref.path.includes(".") ? ref.path.slice(ref.path.lastIndexOf(".")) : "";
    const filename = `${titreSafe}${ext}`;
    const buffer = Buffer.from(await dl.data.arrayBuffer());
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": dl.contentType,
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, max-age=300",
        "Content-Disposition": `inline; filename="${filename}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  // Ancien format data:URI
  if (fichier.startsWith("data:")) {
    const parts = fichier.split(",");
    if (parts.length < 2) return new Response("Fichier invalide", { status: 500 });
    const mime = parts[0].split(":")[1].split(";")[0];
    const buffer = Buffer.from(parts[1], "base64");
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, max-age=300",
        "Content-Disposition": `inline; filename="${titreSafe}"`,
      },
    });
  }

  return new Response("Format de fichier non reconnu", { status: 415 });
};
