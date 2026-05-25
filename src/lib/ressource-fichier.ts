import { isSupabaseFileRef, parseSupabaseFileRef } from "./module-fichier";
import { downloadStorageFile } from "./storage";

export type RessourceRow = {
  id?: string;
  titre?: string;
  nom_fichier?: string;
  fichier?: string;
};

function normalizeTitle(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function findRessourceMatch(
  ressources: RessourceRow[],
  opts: { resourceId?: string; resourceTitle?: string }
): RessourceRow | undefined {
  if (opts.resourceId) {
    const byId = ressources.find((r) => r.id === opts.resourceId);
    if (byId) return byId;
  }
  if (!opts.resourceTitle) return undefined;
  const wanted = normalizeTitle(opts.resourceTitle);
  return ressources.find((r) => {
    if (!r.titre) return false;
    const t = normalizeTitle(r.titre);
    return t === wanted || t.includes(wanted) || wanted.includes(t);
  });
}

export async function getRessourceFileAttachment(
  ressource: RessourceRow
): Promise<{ buffer: Buffer; fileName: string } | null> {
  const fichier = ressource.fichier;
  if (!fichier || fichier === "#") return null;

  const fileName = ressource.nom_fichier || `${ressource.titre ?? "ressource"}.pdf`;

  if (fichier.startsWith("data:")) {
    const parts = fichier.split(",");
    if (parts.length < 2) return null;
    return { buffer: Buffer.from(parts[1], "base64"), fileName };
  }

  if (isSupabaseFileRef(fichier)) {
    const ref = parseSupabaseFileRef(fichier);
    if (!ref) return null;
    const dl = await downloadStorageFile(ref.bucket as "cours-fichiers", ref.path);
    if ("error" in dl) return null;
    const buffer = Buffer.from(await dl.data.arrayBuffer());
    return { buffer, fileName };
  }

  return null;
}
