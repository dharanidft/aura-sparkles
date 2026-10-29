import crypto from "crypto";
import path from "path";
import { StoredOrder } from "./upi-types";
import { SessionTokenPayload } from "./customer-types";

export const ADMIN_COOKIE_NAME = "aura_admin_session";
const ADMIN_MAX_AGE_SECONDS = 24 * 60 * 60; // 24 hours

function getSecuritySecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET || "aura-sparkles-admin-security-salt-2026";
}

export function getAdminPasscode(): string {
  return process.env.ADMIN_PASSCODE || "aura2026";
}

/**
 * Creates a signed admin session token: base64(payload).signature
 */
export function createAdminSessionToken(username: string = "Admin"): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    role: "admin",
    username,
    issuedAt: now,
    expiresAt: now + ADMIN_MAX_AGE_SECONDS,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecuritySecret())
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Validates and decodes signed admin token.
 */
export function verifyAdminSessionToken(token: string): { role: string; username: string } | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", getSecuritySecret())
    .update(payloadB64)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return null;
  }

  try {
    const raw = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload = JSON.parse(raw);
    const now = Math.floor(Date.now() / 1000);

    if (payload.expiresAt < now || payload.role !== "admin") {
      return null;
    }

    return { role: payload.role, username: payload.username };
  } catch {
    return null;
  }
}

/**
 * Verifies admin privileges from either signed cookie or x-admin-passcode header.
 * Uses timing-safe string comparison.
 */
export function verifyAdminRequest(request: Request): { authorized: boolean; username: string } {
  // 1. Check Cookie
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(`${ADMIN_COOKIE_NAME}=`)) {
        const token = cookie.substring(ADMIN_COOKIE_NAME.length + 1);
        const verified = verifyAdminSessionToken(token);
        if (verified) {
          return { authorized: true, username: verified.username };
        }
      }
    }
  }

  // 2. Check x-admin-passcode header
  const authHeader = request.headers.get("x-admin-passcode");
  if (authHeader) {
    const validPass = getAdminPasscode();
    const providedBuffer = Buffer.from(authHeader.trim());
    const expectedBuffer = Buffer.from(validPass.trim());

    if (
      providedBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      return { authorized: true, username: "HeaderAuthenticatedAdmin" };
    }
  }

  return { authorized: false, username: "Anonymous" };
}

/**
 * Row-Level Security (RLS) check for Orders to stop IDOR (Insecure Direct Object Reference).
 * Only the customer who placed the order (or an authorized admin, or matching cryptographic accessKey)
 * is allowed to view or interact with this order.
 */
export function canAccessOrder(
  order: StoredOrder,
  customerSession?: SessionTokenPayload | null,
  accessKey?: string | null,
  isAdmin: boolean = false
): boolean {
  if (isAdmin) return true;

  // Cryptographic access key provided during checkout
  if (accessKey && order.accessKey && accessKey === order.accessKey) {
    return true;
  }

  // Customer session verification
  if (customerSession) {
    if (order.customerUid && order.customerUid === customerSession.uid) {
      return true;
    }
    const cleanEmail = customerSession.email ? customerSession.email.trim().toLowerCase() : "";
    const orderEmail = (order.customerDetails?.email || "").trim().toLowerCase();
    if (cleanEmail && orderEmail && cleanEmail === orderEmail) {
      return true;
    }
    const cleanPhone = customerSession.phoneNumber ? customerSession.phoneNumber.replace(/\D/g, "").slice(-10) : "";
    const orderPhone = (order.customerDetails?.phone || "").replace(/\D/g, "").slice(-10);
    if (cleanPhone && orderPhone && cleanPhone === orderPhone) {
      return true;
    }
  }

  return false;
}

/**
 * Timing-safe webhook HMAC verification (Razorpay, Meta, etc.).
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  if (!rawBody || !signature || !secret) return false;
  try {
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (sigBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Asserts that a target file path resides strictly inside the base directory,
 * defeating path traversal exploits (e.g. `../../etc/passwd`).
 */
export function assertSafeFilePath(baseDir: string, userPath: string): string | null {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(baseDir, userPath);
  if (!resolvedTarget.startsWith(resolvedBase + path.sep)) {
    return null; // Path traversal detected
  }
  return resolvedTarget;
}
