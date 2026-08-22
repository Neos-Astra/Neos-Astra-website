// src/app/api/inquiries/route.ts
// Public POST — saves web leads into Inquiry table
// GET & PATCH — requires superadmin/admin auth

import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";

// Public POST: anyone can submit a web lead / inquiry
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
      message,
      hp_field, // Anti-spam Honeypot field (hidden from real users)
      website,  // Secondary bot trap
    } = body;

    // Honeypot trap: Bots automatically fill all fields. If filled, return fake success without saving
    if (hp_field || website) {
      return NextResponse.json(
        {
          success: true,
          id: "OK",
          message: "Enquiry submitted successfully. Our team will contact you soon.",
        },
        { status: 201 }
      );
    }

    const cleanName = String(studentName || "").trim().slice(0, 100);
    const cleanPhone = String(studentPhone || "").trim().slice(0, 20);
    const cleanEmail = String(studentEmail || "").trim().toLowerCase().slice(0, 100);
    const cleanCourse = String(courseTitle || "").trim().slice(0, 150);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanName || !cleanPhone || !cleanEmail || !cleanCourse || !emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Valid name, phone, email, and course are required." },
        { status: 400 }
      );
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        studentName: cleanName,
        dob: dob ? String(dob).trim().slice(0, 30) : null,
        gender: gender ? String(gender).trim().slice(0, 20) : null,
        classGrade: classGrade ? String(classGrade).trim().slice(0, 50) : null,
        school: school ? String(school).trim().slice(0, 150) : null,
        studentPhone: cleanPhone,
        studentEmail: cleanEmail,
        guardianName: guardianName ? String(guardianName).trim().slice(0, 100) : null,
        courseTitle: cleanCourse,
        message: message ? String(message).trim().slice(0, 1000) : null,
        status: "NEW",
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: inquiry.id,
        message: "Enquiry submitted successfully. Our team will contact you soon.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Inquiry creation error:", error);
    return NextResponse.json(
      { error: "Failed to save enquiry. Please try again." },
      { status: 500 }
    );
  }
}

// GET: retrieve all web leads (Admin only)
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(inquiries);
  } catch (error) {
    console.error("Fetch inquiries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

// PATCH: update inquiry status (Admin only)
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Inquiry ID and new status are required" },
        { status: 400 }
      );
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update inquiry error:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry status" },
      { status: 500 }
    );
  }
}
