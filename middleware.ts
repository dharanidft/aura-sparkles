import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Security constants
const ADMIN_COOKIE_NAME = "aura_admin_session";
const ALLOWED_ORIGINS = [
  "https://www.aurasparkles.com",
  "https://aurasparkles.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

// Helper to verify HMAC signature in Edge Runtime using Web Crypto API
async function verifyAdminEdgeToken(token: string, secretStr: string): Promise<boolean> {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, signature] = parts;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secretStr),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const sigBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
    const expectedSig = Buffer.from(sigBuf).toString("base64url");

    if (signature !== expectedSig) {
      return false;
    }

    const raw = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload = JSON.parse(raw);
    const now = Math.floor(Date.now() / 1000);

    if (payload.expiresAt < now || payload.role !== "admin") {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProd = process.env.NODE_ENV === "production";

  // ---------------------------------------------------------------------------
  // 1. Force HTTPS in Production
  // ---------------------------------------------------------------------------
  const proto = request.headers.get("x-forwarded-proto");
  if (isProd && proto === "http") {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = "https:";
    return NextResponse.redirect(httpsUrl, 301);
  }

  // ---------------------------------------------------------------------------
  // 2. Lock down CORS for API routes
  // ---------------------------------------------------------------------------
  const origin = request.headers.get("origin");
  const isAllowedOrigin = !origin || ALLOWED_ORIGINS.includes(origin);

  // Handle preflight OPTIONS
  if (request.method === "OPTIONS" && pathname.startsWith("/api/")) {
    if (!isAllowedOrigin && isProd) {
      return new NextResponse(null, { status: 403 });
    }
    const preflight = new NextResponse(null, { status: 204 });
    preflight.headers.set("Access-Control-Allow-Origin", origin || "*");
    preflight.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    preflight.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Admin-Passcode, X-CSRF-Token");
    preflight.headers.set("Access-Control-Allow-Credentials", "true");
    preflight.headers.set("Access-Control-Max-Age", "86400");
    return preflight;
  }

  // ---------------------------------------------------------------------------
  // 3. Server-Side Role Check: Hide Admin Pages & Admin APIs
  // ---------------------------------------------------------------------------
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET || "aura-sparkles-admin-security-salt-2026";
  const validPass = (process.env.ADMIN_PASSCODE || "aura2026").trim();

  const adminCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const adminHeader = request.headers.get("x-admin-passcode")?.trim();

  const isCookieValid = adminCookie ? await verifyAdminEdgeToken(adminCookie, secret) : false;
  const isHeaderValid = adminHeader ? adminHeader === validPass : false;
  const isAdminAuthenticated = isCookieValid || isHeaderValid;

  // Protect Admin Pages (/admin, /admin/whatsapp, etc. except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isAdminAuthenticated) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Admin API routes (/api/admin/* except /api/admin/auth/login)
  if (pathname.startsWith("/api/admin/") && !pathname.startsWith("/api/admin/auth/login")) {
    if (!isAdminAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized. Server-side administrator role required." },
        { status: 401 }
      );
    }
  }

  // Proceed with request
  const response = NextResponse.next();

  // Apply CORS header to response if origin is allowed
  if (origin && isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // ---------------------------------------------------------------------------
  // 4. Security Headers (HSTS, CSP, XFO, XCTO, Permissions-Policy)
  // ---------------------------------------------------------------------------
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(self)");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  if (isProd) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // Modern Content-Security-Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://images.unsplash.com https://api.razorpay.com https://raw.githubusercontent.com",
    "media-src 'self' data: blob:",
    "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://raw.githubusercontent.com http://localhost:2785 ws://localhost:2785",
    "frame-src 'self' https://api.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, catalogues, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)",
  ],
};
