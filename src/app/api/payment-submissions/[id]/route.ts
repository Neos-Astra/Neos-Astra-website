// src/app/api/payment-submissions/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";

// PATCH: Admin updates submission status (VERIFIED / REJECTED)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, adminNotes } = body;

    if (!status || !["VERIFIED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status is required (VERIFIED, REJECTED, or PENDING)." },
        { status: 400 }
      );
    }

    const existing = await prisma.paymentSubmission.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Payment submission not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.paymentSubmission.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes !== undefined ? adminNotes : existing.adminNotes,
        reviewedBy: session.user.email || "Admin",
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, submission: updated });
  } catch (error) {
    console.error("Update payment submission error:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}

// DELETE: Admin deletes a submission
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.paymentSubmission.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Payment submission not found." },
        { status: 404 }
      );
    }

    await prisma.paymentSubmission.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete payment submission error:", error);
    return NextResponse.json(
      { error: "Failed to delete submission" },
      { status: 500 }
    );
  }
}
