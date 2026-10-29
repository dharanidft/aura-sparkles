import { NextResponse } from "next/server";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface ClientRecord {
  timestamps: number[];
}

const globalForRateLimit = globalThis as unknown as {
  rateLimitMap?: Map<string, ClientRecord>;
};

const clientMap = globalForRateLimit.rateLimitMap || new Map<string, ClientRecord>();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.rateLimitMap = clientMap;
}

// Periodic cleanup every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of clientMap.entries()) {
      // Remove records older than 1 hour
      record.timestamps = record.timestamps.filter((t) => now - t < 60 * 60 * 1000);
      if (record.timestamps.length === 0) {
        clientMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export const RATE_LIMIT_PRESETS: Record<string, RateLimitConfig> = {
  // Strictest: Admin password attempts
  adminLogin: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 mins
  // Strict: OTP sending & verification
  authOtp: { maxRequests: 5, windowMs: 2 * 60 * 1000 }, // 5 attempts per 2 mins
  // Public contact / enquiry form
  contactForm: { maxRequests: 4, windowMs: 5 * 60 * 1000 }, // 4 enquiries per 5 mins
  // Order creation / checkout
  checkout: { maxRequests: 10, windowMs: 5 * 60 * 1000 }, // 10 checkouts per 5 mins
  // General API endpoints
  generalApi: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per min
};

/**
 * Extracts client IP from standard proxy headers (CF-Connecting-IP, X-Forwarded-For, etc.)
 */
export function getClientIp(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const ips = xff.split(",").map((s) => s.trim());
    if (ips[0]) return ips[0];
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

/**
 * Enforces rate limiting for a client key and action.
 */
export function checkRateLimit(
  identifier: string,
  preset: RateLimitConfig | keyof typeof RATE_LIMIT_PRESETS = "generalApi"
): { allowed: boolean; limit: number; remaining: number; resetSeconds: number } {
  const config = typeof preset === "string" ? (RATE_LIMIT_PRESETS[preset] || RATE_LIMIT_PRESETS.generalApi) : preset;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const record = clientMap.get(identifier) || { timestamps: [] };
  // Filter out timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((t) => t > windowStart);

  if (record.timestamps.length >= config.maxRequests) {
    const oldest = record.timestamps[0];
    const resetSeconds = Math.max(1, Math.ceil((oldest + config.windowMs - now) / 1000));
    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetSeconds,
    };
  }

  record.timestamps.push(now);
  clientMap.set(identifier, record);

  const remaining = Math.max(0, config.maxRequests - record.timestamps.length);
  const resetSeconds = Math.ceil(config.windowMs / 1000);

  return {
    allowed: true,
    limit: config.maxRequests,
    remaining,
    resetSeconds,
  };
}

/**
 * Standardized 429 Too Many Requests response with rate-limit headers.
 */
export function createRateLimitResponse(
  limit: number,
  resetSeconds: number,
  message: string = "Too many requests. Please slow down and try again later."
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      retryAfterSeconds: resetSeconds,
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": resetSeconds.toString(),
        "Retry-After": resetSeconds.toString(),
      },
    }
  );
}
