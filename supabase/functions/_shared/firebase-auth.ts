const FIREBASE_PROJECT_ID = "codebro-92f0c";
const FIREBASE_ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
const FIREBASE_KEYS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

type FirebaseKey = JsonWebKey & { kid: string };
export type FirebaseClaims = Record<string, unknown> & { sub: string; email?: string };

let cachedFirebaseKeys: { keys: FirebaseKey[]; expiresAt: number } | undefined;

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(base64), character => character.charCodeAt(0));
}

function decodeJsonSegment(value: string) {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value)));
}

async function getFirebaseKeys() {
  if (cachedFirebaseKeys && cachedFirebaseKeys.expiresAt > Date.now()) return cachedFirebaseKeys.keys;

  const response = await fetch(FIREBASE_KEYS_URL);
  if (!response.ok) throw new Error("Could not verify sign-in. Please try again.");

  const cacheControl = response.headers.get("Cache-Control") || "";
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/i)?.[1]) || 300;
  const body = await response.json() as { keys: FirebaseKey[] };
  cachedFirebaseKeys = { keys: body.keys, expiresAt: Date.now() + maxAge * 1000 };
  return body.keys;
}

export async function verifyFirebaseToken(authorization: string | null): Promise<FirebaseClaims> {
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) throw new Error("Sign in is required.");

  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Your sign-in token is invalid. Please sign in again.");

  const header = decodeJsonSegment(parts[0]) as { alg?: string; kid?: string };
  const claims = decodeJsonSegment(parts[1]) as Record<string, unknown>;
  if (header.alg !== "RS256" || !header.kid) throw new Error("Your sign-in token is invalid. Please sign in again.");

  const jwk = (await getFirebaseKeys()).find(key => key.kid === header.kid);
  if (!jwk) throw new Error("Your sign-in token is expired or invalid. Please sign in again.");

  const publicKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const validSignature = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    decodeBase64Url(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );

  const now = Math.floor(Date.now() / 1000);
  if (
    !validSignature ||
    claims.iss !== FIREBASE_ISSUER ||
    claims.aud !== FIREBASE_PROJECT_ID ||
    typeof claims.sub !== "string" ||
    !claims.sub ||
    typeof claims.exp !== "number" || claims.exp <= now ||
    typeof claims.iat !== "number" || claims.iat > now
  ) {
    throw new Error("Your sign-in token is expired or invalid. Please sign in again.");
  }

  return claims as FirebaseClaims;
}