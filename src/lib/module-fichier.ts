import { pathFromPublicUrl } from "./storage";

/** Préfixe stocké en base pour les fichiers Supabase Storage (bucket privé). */
export const SUPABASE_FILE_PREFIX = "supabase:";

export function isSupabaseFileRef(ref: string): boolean {
  return ref.startsWith(SUPABASE_FILE_PREFIX);
}

export function isCloudinaryUrl(ref: string): boolean {
  return ref.startsWith("http") && ref.includes("res.cloudinary.com");
}

/** `supabase:cours-fichiers/chemin/fichier.pdf` → bucket + path */
export function parseSupabaseFileRef(ref: string): { bucket: string; path: string } | null {
  if (ref.startsWith(SUPABASE_FILE_PREFIX)) {
    const rest = ref.slice(SUPABASE_FILE_PREFIX.length);
    const slash = rest.indexOf("/");
    if (slash <= 0) return null;
    return { bucket: rest.slice(0, slash), path: rest.slice(slash + 1) };
  }
  const path = pathFromPublicUrl(ref, "cours-fichiers");
  if (path) return { bucket: "cours-fichiers", path };
  return null;
}

export function formatFichierUrlForDisplay(ref: string): string {
  if (isSupabaseFileRef(ref)) return "Document enregistré (Supabase)";
  if (isCloudinaryUrl(ref)) return "Document Cloudinary (ré-uploader si le téléchargement échoue)";
  return ref;
}
