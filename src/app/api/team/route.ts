import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";
import { canManageTeam } from "@/lib/permissions";

export async function GET() {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(teamMembers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !canManageTeam(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, role, domain, badge, bio, image, linkedin, twitter, email, order } = body;

    if (!name || !role || !bio) {
      return NextResponse.json({ error: "Name, role, and bio are required" }, { status: 400 });
    }

    const member = await prisma.teamMember.create({
      data: {
        name,
        role,
        domain: domain || "General",
        badge: badge || "Innovator",
        bio,
        image: image || null,
        linkedin: linkedin || "#",
        twitter: twitter || "#",
        email: email || null,
        order: order !== undefined ? Number(order) : 0,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}
