import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";
import { canManageCareers } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const all = url.searchParams.get("all") === "true";

    const session = await auth();
    const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

    const where = (all && isSuperAdmin) ? {} : { isActive: true };

    const jobs = await prisma.jobOpening.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(jobs, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json({ error: "Failed to fetch job openings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !canManageCareers(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized. Super Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { title, department, location, type, description, requirements, salary, applyLink, isActive } = body;

    if (!title || !department || !description) {
      return NextResponse.json(
        { error: "Title, department, and description are required fields." },
        { status: 400 }
      );
    }

    const job = await prisma.jobOpening.create({
      data: {
        title: title.trim(),
        department: department.trim(),
        location: location ? location.trim() : "Remote / On-site",
        type: type ? type.trim() : "Full-time",
        description: description.trim(),
        requirements: requirements ? requirements.trim() : null,
        salary: salary ? salary.trim() : null,
        applyLink: applyLink ? applyLink.trim() : null,
        isActive: typeof isActive === "boolean" ? isActive : true,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("POST /api/jobs error:", error);
    return NextResponse.json({ error: "Failed to create job opening" }, { status: 500 });
  }
}
