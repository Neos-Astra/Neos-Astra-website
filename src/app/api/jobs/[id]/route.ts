import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";
import { canManageCareers } from "@/lib/permissions";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !canManageCareers(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized. Super Admin access required." }, { status: 403 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const body = await request.json();
    const { title, department, location, type, description, requirements, salary, applyLink, isActive } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (department !== undefined) updateData.department = department.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (type !== undefined) updateData.type = type.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (requirements !== undefined) updateData.requirements = requirements ? requirements.trim() : null;
    if (salary !== undefined) updateData.salary = salary ? salary.trim() : null;
    if (applyLink !== undefined) updateData.applyLink = applyLink ? applyLink.trim() : null;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    const updatedJob = await prisma.jobOpening.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error("PATCH /api/jobs/[id] error:", error);
    return NextResponse.json({ error: "Failed to update job opening" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !canManageCareers(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized. Super Admin access required." }, { status: 403 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    await prisma.jobOpening.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Job opening deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/jobs/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete job opening" }, { status: 500 });
  }
}
