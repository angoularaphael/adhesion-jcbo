import type { APIRoute } from "astro";
import { getAdherentByEmail } from "../../../../lib/store";
import {
  isCloudinaryUrl,
  parseSupabaseFileRef,
} from "../../../../lib/module-fichier";
import { downloadStorageFile } from "../../../../lib/storage";
import { getSupabase } from "../../../../lib/supabase";

/**
 * Téléchargement sécurisé d'un fichier de cours (PDF/DOC) ou streaming vidéo.
 * - PDF/DOC : Supabase Storage (bucket privé) via clé service
 * - Vidéos : Cloudinary (URL publique ou proxifiée)
 * - Anciens PDF Cloudinary : message invitant à ré-uploader
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

  const supa = getSupabase();
  const { data: moduleRow } = await supa
    .from("modules")
    .select("id, cours_id, titre, fichier_url, video_url")
    .eq("id", moduleId)
    .maybeSingle();

  if (!moduleRow) {
    return new Response("Module introuvable", { status: 404 });
  }

  const remoteRef = kind === "video" ? moduleRow.video_url : moduleRow.fichier_url;
  if (!remoteRef) {
    return new Response("Aucun fichier associé à ce module.", { status: 404 });
  }

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

  const titreSafe = moduleRow.titre.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 60) || "fichier";

  // ─── Fichier document (Supabase ou legacy Cloudinary) ─────────────────────
  if (kind === "fichier") {
    const storageRef = parseSupabaseFileRef(remoteRef);
    if (storageRef) {
      const dl = await downloadStorageFile(
        storageRef.bucket as "cours-fichiers",
        storageRef.path
      );
      if ("error" in dl) {
        return new Response(
          "Le document n'a pas pu être récupéré. Ré-uploadez-le depuis l'administration.",
          { status: 502 }
        );
      }
      const ext = storageRef.path.includes(".")
        ? storageRef.path.slice(storageRef.path.lastIndexOf("."))
        : ".pdf";
      const filename = `${titreSafe}${ext}`;
      const buffer = Buffer.from(await dl.data.arrayBuffer());
      // Toujours `inline` : le document s'affiche dans l'app, pas en téléchargement local.
      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": dl.contentType,
          "Content-Length": String(buffer.length),
          "Cache-Control": "private, max-age=300",
          "Content-Disposition": `inline; filename="${filename}"`,
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer",
        },
      });
    }

    if (!isCloudinaryUrl(remoteRef)) {
      return new Response("Référence de fichier invalide. Ré-uploadez le document.", { status: 404 });
    }

    return new Response(
      "Ce document est encore sur Cloudinary (accès bloqué). Depuis l'admin, ouvrez le module et ré-uploadez le PDF.",
      { status: 410, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  // ─── Vidéo : redirection directe vers Cloudinary ──────────────────────────
  // Les vidéos Cloudinary sont publiques et supportent le streaming Range nativement.
  // Re-streamer depuis le serveur Astro casse la lecture (pas de support Range).
  if (!remoteRef.startsWith("http")) {
    return new Response("URL vidéo invalide.", { status: 404 });
  }
  return new Response(null, {
    status: 302,
    headers: { Location: remoteRef, "Cache-Control": "private, max-age=60" },
  });
};
