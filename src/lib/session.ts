import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  import.meta.env.SESSION_SECRET || "jcbo-dev-secret"
);

export interface SessionPayload {
  email: string;
  role: "admin" | "adherent" | "diagnostic";
  diagnosticId?: string;
  adminId?: string;
  adminRole?: "super_admin" | "admin";
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function verifySessionFromRequest(request: Request): Promise<SessionPayload | null> {
  const auth = request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) {
    return verifySession(auth.slice(7));
  }
  return null;
}
