// src/app/api/payment-submissions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";

// POST: Public — Student submits payment proof (no auth required)
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const studentName = formData.get("studentName") as string | null;
    const schoolName = formData.get("schoolName") as string | null;
    const emailId = formData.get("emailId") as string | null;
    const utrNumber = (formData.get("utrNumber") as string) || "";
    const file = formData.get("screenshot") as File | null;

    // Validation
    if (!studentName?.trim() || !schoolName?.trim() || !emailId?.trim()) {
      return NextResponse.json(
        { error: "Student Name, School Name, and Email ID are required." },
        { status: 400 }
      );
    }

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "Payment screenshot is required." },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WEBP images are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB." },
        { status: 400 }
      );
    }

    // Upload to persistent storage (Supabase / local fallback)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const rawName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, "") : "screenshot.jpg";
    const filename = `payment-${Date.now()}-${rawName}`;
    const mimeType = file.type || "image/jpeg";

    let screenshotUrl = "";
    try {
      const { uploadPersistentFile } = await import("@/lib/storage");
      screenshotUrl = await uploadPersistentFile({
        bucket: "payment-submissions",
        filename,
        buffer,
        contentType: mimeType,
      });
    } catch (uploadErr) {
      console.warn("Persistent upload failed, using base64 fallback:", uploadErr);
      screenshotUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    }

    if (!screenshotUrl) {
      return NextResponse.json(
        { error: "Could not process screenshot image." },
        { status: 400 }
      );
    }

    // Save to database
    const submission = await prisma.paymentSubmission.create({
      data: {
        studentName: studentName.trim(),
        schoolName: schoolName.trim(),
        emailId: emailId.trim().toLowerCase(),
        screenshotUrl,
        utrNumber: utrNumber.trim(),
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Payment details submitted successfully! Admin will verify it shortly.",
        submission: {
          id: submission.id,
          studentName: submission.studentName,
          status: submission.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Payment submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit payment details. Please try again." },
      { status: 500 }
    );
  }
}

// GET: Admin only — Fetch all payment submissions
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submissions = await prisma.paymentSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Count stats
    const stats = {
      total: submissions.length,
      pending: submissions.filter((s) => s.status === "PENDING").length,
      verified: submissions.filter((s) => s.status === "VERIFIED").length,
      rejected: submissions.filter((s) => s.status === "REJECTED").length,
    };

    return NextResponse.json({ submissions, stats });
  } catch (error) {
    console.error("Fetch payment submissions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment submissions" },
      { status: 500 }
    );
  }
}
