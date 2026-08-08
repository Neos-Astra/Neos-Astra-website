import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";
import { canManageHomeMedia } from "@/lib/permissions";
import fs from "fs";
import path from "path";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !canManageHomeMedia(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    
    // Find media first to get imageUrl
    const media = await prisma.homeMedia.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete from DB
    await prisma.homeMedia.delete({
      where: { id },
    });

    // Delete file if it exists locally
    if (media.imageUrl.startsWith("/uploads/")) {
      const filepath = path.join(process.cwd(), "public", media.imageUrl);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    return NextResponse.json({ message: "Media deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
