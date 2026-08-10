// src/app/api/enrollments/route.ts
// Public POST — anyone can submit an enrollment form
// GET — requires superadmin/admin auth

import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";

function generateRegistrationNo() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `NA-${new Date().getFullYear()}-${rand}`;
}

// POST: public enrollment submission
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentName,
      dob,
      gender,
      classGrade,
      school,
      studentPhone,
      studentEmail,
      guardianName,
      courseTitle,
      admissionFee,
      kitPrice,
      hasKit,
      gstPercent,
      total,
      message,
    } = body;

    if (!studentName || !studentPhone || !studentEmail || !courseTitle) {
      return NextResponse.json(
        { error: "Name, phone, email and course are required" },
        { status: 400 }
      );
    }

    const registrationNo = generateRegistrationNo();

    const enrollment = await prisma.enrollment.create({
      data: {
        registrationNo,
        studentName,
        dob: dob || null,
        gender: gender || null,
        classGrade: classGrade || null,
        school: school || null,
        studentPhone,
        studentEmail,
        guardianName: guardianName || null,
        courseTitle,
        admissionFee: admissionFee || "",
        kitPrice: kitPrice || "",
        hasKit: hasKit ?? false,
        gstPercent: gstPercent ?? 0,
        total: total || "",
        message: message || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      { registrationNo: enrollment.registrationNo, id: enrollment.id, enrollment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Failed to save enrollment" },
      { status: 500 }
    );
  }
}

// GET: admin/superadmin only
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enrollments = await prisma.enrollment.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}

// PATCH: update enrollment status (admin/superadmin)
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json(
        { error: "ID and status are required" },
        { status: 400 }
      );
    }

    const updated = await prisma.enrollment.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update enrollment status error:", error);
    return NextResponse.json(
      { error: "Failed to update enrollment status" },
      { status: 500 }
    );
  }
}

// DELETE: delete enrollment record (admin/superadmin)
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    let id = url.searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch (e) {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "Enrollment ID is required" },
        { status: 400 }
      );
    }

    await prisma.enrollment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Enrollment deleted successfully" });
  } catch (error) {
    console.error("Delete enrollment error:", error);
    return NextResponse.json(
      { error: "Failed to delete enrollment" },
      { status: 500 }
    );
  }
}

