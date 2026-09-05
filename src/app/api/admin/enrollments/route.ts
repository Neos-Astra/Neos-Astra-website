// src/app/api/admin/enrollments/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enrollments = await prisma.enrollment.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      registrationNo: true,
      studentName: true,
      studentEmail: true,
      studentPhone: true,
      school: true,
      classGrade: true,
      courseTitle: true,
      admissionFee: true,
      kitPrice: true,
      status: true,
      createdAt: true,
    },
  });
  return NextResponse.json(enrollments);
}
