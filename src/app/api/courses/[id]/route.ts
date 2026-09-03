import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";
import { canManageCourses } from "@/lib/permissions";

function formatAmount(val: number): string {
  return `₹${val.toLocaleString("en-IN")}`;
}

function parseAmount(val: string | null | undefined): number {
  if (!val) return 0;
  return parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
}

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

    // Fetch old course to get the previous title (for matching enrollments)
    const oldCourse = await prisma.course.findUnique({ where: { id } });

    // Update the course record
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

    // --- Cascade pricing & title changes to existing enrollments ---
    if (oldCourse) {
      const resolvedHasKit = hasKit ?? false;
      const resolvedGstPercent = gstPercent ?? 0;
      const resolvedAdmissionFee = admissionFee || "";
      const resolvedKitPrice = kitPrice || "";

      // Compute the new total
      const base = parseAmount(resolvedAdmissionFee) + (resolvedHasKit ? parseAmount(resolvedKitPrice) : 0);
      const gstAmt = Math.round((base * resolvedGstPercent) / 100);
      const newTotal = formatAmount(base + gstAmt);

      // Update all enrollments that matched the old course title
      await prisma.enrollment.updateMany({
        where: { courseTitle: oldCourse.title },
        data: {
          courseTitle: title,           // update if course was renamed
          admissionFee: resolvedAdmissionFee,
          kitPrice: resolvedHasKit ? resolvedKitPrice : "",
          hasKit: resolvedHasKit,
          gstPercent: resolvedGstPercent,
          total: newTotal,
        },
      });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Failed to update course:", error);
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
