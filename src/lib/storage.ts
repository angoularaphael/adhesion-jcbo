import { getSupabase } from "./supabase";

export type StorageBucket = "actualites" | "profils" | "cours-fichiers" | "videos-formation";

export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: Buffer | Uint8Array,
  contentType: string
): Promise<{ url: string } | { error: string }> {
  const supabase = getSupabase();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType,
    upsert: true,
  });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function deleteFile(bucket: StorageBucket, path: string): Promise<boolean> {
  const { error } = await getSupabase().storage.from(bucket).remove([path]);
  return !error;
}

export function pathFromPublicUrl(url: string, bucket: StorageBucket): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export async function downloadStorageFile(
  bucket: StorageBucket,
  path: string
): Promise<{ data: Blob; contentType: string } | { error: string }> {
  const { data, error } = await getSupabase().storage.from(bucket).download(path);
  if (error || !data) return { error: error?.message ?? "Fichier introuvable." };
  return { data, contentType: data.type || "application/octet-stream" };
}
