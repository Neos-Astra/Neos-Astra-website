// src/app/api/auth/admin-login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { comparePassword, setAuthCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
  // ── Rate limiting: block brute force ──────────────────────
  const limited = await checkRateLimit(req);
  if (limited) return limited;
  // ──────────────────────────────────────────────────────────

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Must be active admin or super admin
    if (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!admin.isActive) {
      return NextResponse.json({ error: "Account is disabled" }, { status: 403 });
    }

    const valid = await comparePassword(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = require("jsonwebtoken").sign(
      { id: admin.id, role: admin.role, email: admin.email },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({ success: true });
    setAuthCookie(res, token);
    return res;
  } catch (e) {
    console.error("Admin login error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
