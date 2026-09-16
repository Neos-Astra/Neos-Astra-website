// src/lib/rateLimiter.ts
// Multi-tier Rate Limiter — protects login and form submission endpoints from spam & brute force

import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextRequest, NextResponse } from "next/server";

// 1. Strict Limiter for Authentication / Login: 5 attempts per 15 minutes
const loginLimiter = new RateLimiterMemory({
  points: 5,
  duration: 15 * 60,
  blockDuration: 15 * 60,
});

// 2. Form Submission Limiter (Inquiries, Enrollments, Survey): 10 requests per minute per IP
const formLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
  blockDuration: 60,
});

function getClientIp(req: NextRequest | Request): string {
  const headers = req.headers;
  const forwarded =
    (headers instanceof Headers
      ? headers.get("x-forwarded-for")
      : (headers as any)["x-forwarded-for"]) || "";

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp =
    headers instanceof Headers
      ? headers.get("x-real-ip")
      : (headers as any)["x-real-ip"];

  return realIp || "127.0.0.1";
}

/**
 * Checks rate limit for public form submissions (Inquiries, Enrollments, Surveys).
 * Returns NextResponse with 429 if exceeded, otherwise null.
 */
export async function checkFormRateLimit(req: NextRequest | Request): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  try {
    await formLimiter.consume(ip);
    return null;
  } catch (rej: any) {
    const retrySecs = Math.round((rej?.msBeforeNext || 60000) / 1000) || 60;
    return NextResponse.json(
      {
        error: "Too many requests. Please wait a moment before trying again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retrySecs),
        },
      }
    );
  }
}

/**
 * Checks rate limit for login / authentication attempts.
 */
export async function checkRateLimit(req: NextRequest | Request): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  try {
    await loginLimiter.consume(ip);
    return null;
  } catch {
    return NextResponse.json(
      {
        error: "Too many login attempts. Please wait 15 minutes before trying again.",
      },
      { status: 429 }
    );
  }
}
