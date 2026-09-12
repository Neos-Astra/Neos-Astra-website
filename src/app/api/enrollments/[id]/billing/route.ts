// src/app/api/enrollments/[id]/billing/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";

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
    const { billingDay, monthlyFee } = body;

    const dataToUpdate: any = {};
    if (billingDay !== undefined) {
      const day = parseInt(billingDay, 10);
      if (day >= 1 && day <= 31) {
        dataToUpdate.billingDay = day;
      }
    }
    if (monthlyFee !== undefined) {
      dataToUpdate.monthlyFee = String(monthlyFee).trim();
    }

    const updated = await prisma.enrollment.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, enrollment: updated });
  } catch (error) {
    console.error("Update billing settings error:", error);
    return NextResponse.json({ error: "Failed to update billing settings" }, { status: 500 });
  }
}
