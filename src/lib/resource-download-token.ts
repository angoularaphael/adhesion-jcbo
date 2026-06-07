import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  import.meta.env.SESSION_SECRET || "jcbo-dev-secret"
);

export interface ResourceDownloadPayload {
  type: "resource-download";
  resourceId: string;
  email: string;
}

export async function createResourceDownloadToken(payload: {
  resourceId: string;
  email: string;
}): Promise<string> {
  return new SignJWT({
    type: "resource-download",
    resourceId: payload.resourceId,
    email: payload.email.toLowerCase(),
  } satisfies ResourceDownloadPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyResourceDownloadToken(
  token: string
): Promise<ResourceDownloadPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.type !== "resource-download" || typeof payload.resourceId !== "string") {
      return null;
    }
    return {
      type: "resource-download",
      resourceId: payload.resourceId,
      email: String(payload.email ?? "").toLowerCase(),
    };
  } catch {
    return null;
  }
}
