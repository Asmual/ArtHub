import crypto from "crypto";

const DEFAULT_SECRET = "092de91c49c4ac4973f345857cc126380d4de54870b543d9131e5a8d288d5629";

/**
 * Sign payload using HMAC-SHA256 (HS256) standard JSON Web Token format
 * 100% binary signature compatible with jsonwebtoken npm package.
 */
export function signJwt(payload, expiresInSeconds = 7 * 24 * 3600) {
  const secret = process.env.JWT_SECRET || process.env.BETTER_AUTH_SECRET || DEFAULT_SECRET;
  const header = { alg: "HS256", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;

  const b64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const b64Payload = Buffer.from(JSON.stringify({ ...payload, iat, exp })).toString("base64url");

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${b64Header}.${b64Payload}`)
    .digest("base64url");

  return `${b64Header}.${b64Payload}.${signature}`;
}

/**
 * Verify and decode an HS256 JWT token string
 */
export function verifyJwt(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [b64Header, b64Payload, signature] = parts;
  const secret = process.env.JWT_SECRET || process.env.BETTER_AUTH_SECRET || DEFAULT_SECRET;

  try {
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${b64Header}.${b64Payload}`)
      .digest("base64url");

    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(b64Payload, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
