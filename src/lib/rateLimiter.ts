// src/lib/rateLimiter.ts
// In-memory rate limiter — protects login routes from brute force attacks
// Rule: max 5 attempts per IP per 15 minutes → then blocked for 15 minutes

import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextRequest } from "next/server";

const limiter = new RateLimiterMemory({
  points: 5,       // 5 attempts allowed
  duration: 15 * 60, // per 15 minutes (900 seconds)
  blockDuration: 15 * 60, // block for 15 minutes after exceeding
});

/**
 * Returns an error response if rate limit is exceeded, otherwise null.
 * Usage: const limited = await checkRateLimit(req); if (limited) return limited;
 */
export async function checkRateLimit(req: NextRequest | Request) {
  const forwarded =
    (req.headers instanceof Headers
      ? req.headers.get("x-forwarded-for")
      : (req.headers as any)["x-forwarded-for"]) || "unknown";

  const ip = typeof forwarded === "string"
    ? forwarded.split(",")[0].trim()
    : "unknown";

  try {
    await limiter.consume(ip);
    return null; // not rate limited — continue
  } catch {
    // Rate limit exceeded
    const { NextResponse } = await import("next/server");
    return NextResponse.json(
      {
        error:
          "Too many login attempts. Please wait 15 minutes before trying again.",
      },
      { status: 429 }
    );
  }
}
