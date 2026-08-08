import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";
import { canManageCourses } from "@/lib/permissions";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      where: { isActive: true },
    });
    return NextResponse.json(courses, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !canManageCourses(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, description, category, track, price, admissionFee, kitPrice, duration, badge, image } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category: category || "General",
        track: track || "General",
        price: price || "₹3,100",
        admissionFee: admissionFee || "₹2,000",
        kitPrice: kitPrice || "₹1,100",
        duration: duration || "4 Weeks",
        badge: badge || "Popular",
        image: image || null,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
