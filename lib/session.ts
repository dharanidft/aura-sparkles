import crypto from "crypto";
import { cookies } from "next/headers";
import { SessionTokenPayload } from "./customer-types";

const SESSION_COOKIE_NAME = "aura_customer_session";
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSCODE || "aura-sparkles-customer-session-secret-key-2026";
  return secret;
}

/**
 * Creates a signed session token: base64(payload).signature
 */
export function createSessionToken(uid: string, phoneNumber: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionTokenPayload = {
    uid,
    phoneNumber,
    issuedAt: now,
    expiresAt: now + SESSION_MAX_AGE_SECONDS,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Validates and decodes a signed session token.
 * Returns null if signature is invalid or token has expired.
 */
export function verifySessionToken(token: string): SessionTokenPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payloadB64)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return null;
  }

  try {
    const raw = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload = JSON.parse(raw) as SessionTokenPayload;
    const now = Math.floor(Date.now() / 1000);

    if (payload.expiresAt < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies current customer session from incoming request cookies or Authorization header.
 */
export function getAuthenticatedCustomerFromRequest(request: Request): SessionTokenPayload | null {
  // 1. Check Authorization Bearer header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const verified = verifySessionToken(token);
    if (verified) return verified;
  }

  // 2. Check Cookie header
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(`${SESSION_COOKIE_NAME}=`)) {
        const token = cookie.substring(SESSION_COOKIE_NAME.length + 1);
        const verified = verifySessionToken(token);
        if (verified) return verified;
      }
    }
  }

  return null;
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS };
