import { getAdminByEmail } from "./store-admin";

export function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function requireAdminSession(locals: App.Locals): Response | null {
  if (!locals.session || locals.session.role !== "admin") {
    return jsonError("Non autorisé", 401);
  }
  return null;
}

export async function requireSuperAdminSession(locals: App.Locals): Promise<Response | null> {
  const denied = requireAdminSession(locals);
  if (denied) return denied;

  const admin = await getAdminByEmail(locals.session!.email);
  if (!admin || admin.role !== "super_admin" || admin.statut !== "Actif") {
    return jsonError("Accès réservé au super administrateur.", 403);
  }
  return null;
}

export async function isSuperAdminEmail(email: string): Promise<boolean> {
  const admin = await getAdminByEmail(email);
  return !!admin && admin.role === "super_admin" && admin.statut === "Actif";
}

export function getSessionEmail(locals: App.Locals): string {
  return locals.session?.email ?? "";
}
