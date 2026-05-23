export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120) || "article";
}

export async function uniqueSlug(base: string, exists: (s: string) => Promise<boolean>): Promise<string> {
  let slug = slugify(base);
  let candidate = slug;
  let n = 1;
  while (await exists(candidate)) {
    candidate = `${slug}-${n++}`;
  }
  return candidate;
}
