import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";
import { canManageHomeMedia } from "@/lib/permissions";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function GET() {
  try {
    const media = await prisma.homeMedia.findMany({
      orderBy: { position: "asc" },
    });
    return NextResponse.json(media);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch home media" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !canManageHomeMedia(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const position = formData.get("position")?.toString() || "0";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save locally
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);
    const imageUrl = `/uploads/${filename}`;

    const media = await prisma.homeMedia.create({
      data: {
        imageUrl,
        position: parseInt(position),
        updatedBy: session.user.id,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to upload media" }, { status: 500 });
  }
}
