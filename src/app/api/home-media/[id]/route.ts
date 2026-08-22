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
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const userRole = session.user.role || (session.user as any).role;
    if (!canManageHomeMedia(userRole) && !session.user.canManageContent) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
      try {
        const filepath = path.join(process.cwd(), "public", media.imageUrl);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      } catch (fileErr) {
        console.warn("Could not delete local file:", fileErr);
      }
    }

    return NextResponse.json({ message: "Media deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting home media:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete media" }, { status: 500 });
  }
}

