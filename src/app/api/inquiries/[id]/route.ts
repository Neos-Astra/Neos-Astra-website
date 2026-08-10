// src/app/api/inquiries/[id]/route.ts

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing inquiry ID" }, { status: 400 });
  }

  try {
    await prisma.inquiry.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Inquiry deleted" });
  } catch (error) {
    console.error("Delete inquiry error:", error);
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}
