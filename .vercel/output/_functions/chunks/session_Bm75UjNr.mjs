import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  "jcbo-secret-key-change-in-production-2025"
);
async function createSession(payload) {
  return new SignJWT({ ...payload }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(secret);
}
async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export { createSession as c, verifySession as v };
