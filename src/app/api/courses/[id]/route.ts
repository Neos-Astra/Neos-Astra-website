import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";
import { canManageCourses } from "@/lib/permissions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !canManageCourses(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, category, track, price, admissionFee, kitPrice, hasKit, gstPercent, duration, badge, image, isActive } = body;

    const course = await prisma.course.update({
      where: { id },
      data: {
        title,
        description,
        category,
        track,
        price,
        admissionFee,
        kitPrice,
        hasKit: hasKit ?? false,
        gstPercent: gstPercent ?? 0,
        duration,
        badge,
        image,
        isActive,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !canManageCourses(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.course.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
