// src/app/api/payment-submissions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";

// POST: Public — Student submits payment details / proof (no auth required)
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let studentName = "";
    let schoolName = "";
    let emailId = "";
    let classGrade = "";
    let utrNumber = "";
    let screenshotUrl = "";
    let amount = "2006";
    let registrationNo = "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      registrationNo = (body.registrationNo || "").trim();
      studentName = (body.studentName || "").trim();
      schoolName = (body.schoolName || "").trim();
      emailId = (body.emailId || "").trim().toLowerCase();
      classGrade = (body.classGrade || body.class || "").trim();
      utrNumber = (body.utrNumber || "").trim();
      screenshotUrl = (body.screenshotUrl || "").trim();
      if (body.amount) amount = String(body.amount).trim();
    } else {
      const formData = await request.formData();
      registrationNo = ((formData.get("registrationNo") as string) || "").trim();
      studentName = ((formData.get("studentName") as string) || "").trim();
      schoolName = ((formData.get("schoolName") as string) || "").trim();
      emailId = ((formData.get("emailId") as string) || "").trim().toLowerCase();
      classGrade = ((formData.get("classGrade") as string) || (formData.get("class") as string) || "").trim();
      utrNumber = ((formData.get("utrNumber") as string) || "").trim();
      const file = formData.get("screenshot") as File | null;
      if (formData.get("amount")) amount = String(formData.get("amount")).trim();

      if (file && file.size > 0) {
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
      }
    }

    // Required Field Validations
    if (!studentName || !schoolName || !emailId) {
      return NextResponse.json(
        { error: "Student Name, School Name, and Email ID are required." },
        { status: 400 }
      );
    }

    if (!emailId.includes("@") || !emailId.includes(".")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // If no screenshot was uploaded (e.g. initial Direct UPI click), use clean default
    if (!screenshotUrl) {
      screenshotUrl = "/logo.jpg";
    }

    const schoolDisplay = classGrade ? `${schoolName} (Class: ${classGrade})` : schoolName;
    const noteText = classGrade
      ? `Class: ${classGrade} | ₹${amount} via Direct Bandhan UPI (3451323a@bandhan)`
      : `₹${amount} via Direct Bandhan UPI (3451323a@bandhan)`;

    // Save to database
    const submission = await prisma.paymentSubmission.create({
      data: {
        studentName,
        schoolName: schoolDisplay,
        emailId,
        screenshotUrl,
        utrNumber: utrNumber || "",
        status: "PENDING",
        adminNotes: noteText,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Payment submitted — awaiting verification.",
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
