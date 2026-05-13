import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  import.meta.env.SESSION_SECRET || "jcbo-dev-secret"
);

export interface SessionPayload {
  email: string;
  role: "admin" | "adherent";
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
