import type { APIRoute } from "astro";
import { getAdherentByEmail } from "../../../../lib/store";
import { getSupabase } from "../../../../lib/supabase";

/**
 * Téléchargement sécurisé d'un fichier de cours (PDF/DOC) ou redirection vidéo.
 *
 * - Vérifie que l'adhérent est inscrit au cours qui contient ce module
 *   (ou que l'utilisateur est admin).
 * - Va chercher le fichier sur Cloudinary côté serveur (les comptes Cloudinary
 *   gratuits bloquent la livraison publique des PDF — passer par le serveur
 *   contourne le HTTP 401).
 * - Streame le contenu au navigateur avec `Content-Disposition: attachment`,
 *   ce qui (a) force le téléchargement et (b) cache l'URL Cloudinary réelle.
 *
 * `?inline=1`  → renvoie le fichier en `inline` (pour preview vidéo).
 */
export const GET: APIRoute = async ({ params, url, locals }) => {
  if (!locals.session) {
    return new Response("Non autorisé", { status: 401 });
  }

  const moduleId = params.moduleId;
  if (!moduleId) {
    return new Response("ID module requis", { status: 400 });
  }

  const kind = url.searchParams.get("type") === "video" ? "video" : "fichier";
  const inline = url.searchParams.get("inline") === "1" || kind === "video";

  const supa = getSupabase();
  const { data: moduleRow } = await supa
    .from("modules")
    .select("id, cours_id, titre, fichier_url, video_url")
    .eq("id", moduleId)
    .maybeSingle();

  if (!moduleRow) {
    return new Response("Module introuvable", { status: 404 });
  }

  const remoteUrl = kind === "video" ? moduleRow.video_url : moduleRow.fichier_url;
  if (!remoteUrl) {
    return new Response("Aucun fichier associé à ce module.", { status: 404 });
  }

  // ─── Contrôle d'accès ───────────────────────────────────────────────────────
  if (locals.session.role !== "admin") {
    const adherent = await getAdherentByEmail(locals.session.email);
    if (!adherent) {
      return new Response("Non autorisé", { status: 403 });
    }
    if (!adherent.coursInscrits.includes(moduleRow.cours_id)) {
      return new Response(
        "Vous n'êtes pas inscrit à cette formation. Inscrivez-vous depuis « Mes cours ».",
        { status: 403 }
      );
    }
  }

  // ─── Récupération du fichier côté serveur ───────────────────────────────────
  // Cloudinary peut bloquer la livraison publique des PDF (compte Free) ; on
  // tente la même URL d'abord, puis on bascule entre /image/upload et /raw/upload
  // si nécessaire.
  const fetchTargets = [remoteUrl];
  if (remoteUrl.includes("/image/upload/")) {
    fetchTargets.push(remoteUrl.replace("/image/upload/", "/raw/upload/"));
  } else if (remoteUrl.includes("/raw/upload/")) {
    fetchTargets.push(remoteUrl.replace("/raw/upload/", "/image/upload/"));
  }

  let upstream: Response | null = null;
  for (const target of fetchTargets) {
    try {
      const r = await fetch(target);
      if (r.ok) {
        upstream = r;
        break;
      }
    } catch {
      /* essayer la cible suivante */
    }
  }

  if (!upstream) {
    return new Response(
      "Le fichier n'a pas pu être récupéré. Si l'erreur persiste, ré-uploadez-le depuis l'admin.",
      { status: 502 }
    );
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const contentLength = upstream.headers.get("content-length") ?? undefined;

  // Nom de fichier proposé au navigateur
  const extFromUrl = (() => {
    try {
      const u = new URL(remoteUrl);
      const last = u.pathname.split("/").pop() ?? "";
      const dot = last.lastIndexOf(".");
      return dot >= 0 ? last.slice(dot) : "";
    } catch {
      return "";
    }
  })();
  const titreSafe = moduleRow.titre.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 60) || "fichier";
  const ext = extFromUrl || (kind === "video" ? ".mp4" : ".pdf");
  const filename = `${titreSafe}${ext}`;

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": "private, max-age=300",
    "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  };
  if (contentLength) headers["Content-Length"] = contentLength;

  return new Response(upstream.body, { status: 200, headers });
};
