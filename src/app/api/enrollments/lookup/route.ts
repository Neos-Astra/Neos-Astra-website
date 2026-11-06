// src/app/api/enrollments/lookup/route.ts
// Public endpoint for parents/students on /pay page to auto-fill student details by Reg No

import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = (searchParams.get("regNo") || "").trim();

    if (!raw || raw.toUpperCase() === "NA-" || raw.length < 3) {
      return NextResponse.json({ found: false });
    }

    const clean = raw.toUpperCase();
    const cleanWithPrefix = clean.startsWith("NA-") ? clean : `NA-${clean}`;
    const cleanWithoutPrefix = clean.startsWith("NA-") ? clean.replace(/^NA-/, "") : clean;

    const student = await prisma.enrollment.findFirst({
      where: {
        OR: [
          { registrationNo: { equals: cleanWithPrefix, mode: "insensitive" } },
          { registrationNo: { equals: clean, mode: "insensitive" } },
          { registrationNo: { equals: cleanWithoutPrefix, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        registrationNo: true,
        studentName: true,
        school: true,
        studentEmail: true,
        classGrade: true,
        courseTitle: true,
        monthlyFee: true,
      },
    });

    if (!student) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      student: {
        registrationNo: student.registrationNo,
        studentName: student.studentName,
        school: student.school || "",
        studentEmail: student.studentEmail || "",
        classGrade: student.classGrade || "",
        courseTitle: student.courseTitle || "",
        monthlyFee: student.monthlyFee || "",
      },
    });
  } catch (error) {
    console.error("Student lookup error:", error);
    return NextResponse.json({ found: false, error: "Lookup failed" }, { status: 500 });
  }
}

