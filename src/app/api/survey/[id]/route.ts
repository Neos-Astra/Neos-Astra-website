import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing response ID" }, { status: 400 });
    }

    await prisma.ngoSurveyResponse.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Response deleted successfully" });
  } catch (error) {
    console.error("Delete survey response error:", error);
    return NextResponse.json(
      { error: "Failed to delete survey response." },
      { status: 500 }
    );
  }
}
