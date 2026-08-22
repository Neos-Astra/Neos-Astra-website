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
    return NextResponse.json(media, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Error fetching home media:", error);
    return NextResponse.json({ error: "Failed to fetch home media" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthenticated. Please log in again." }, { status: 401 });
    }

    const userRole = session.user.role || (session.user as any).role;
    if (!canManageHomeMedia(userRole) && !session.user.canManageContent) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") || "";
    let position = 0;
    let title = "";
    let imageUrl = "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      position = Number(body.position || 0);
      title = String(body.title || "").trim();
      imageUrl = body.imageUrl || body.imageBase64 || "";

      if (!imageUrl) {
        return NextResponse.json({ error: "Image data is required." }, { status: 400 });
      }

      // If it's a base64 data URL, try to save to disk, or keep data URL as fallback
      if (imageUrl.startsWith("data:image/")) {
        try {
          const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const extMatch = matches[1].split("/")[1] || "jpeg";
            const ext = extMatch.replace("e", "") === "jpg" ? "jpg" : extMatch === "webp" ? "webp" : "png";
            const buffer = Buffer.from(matches[2], "base64");

            const uploadDir = path.join(process.cwd(), "public/uploads");
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }

            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const filename = `hero-${uniqueSuffix}.${ext}`;
            const filepath = path.join(uploadDir, filename);

            await writeFile(filepath, buffer);
            imageUrl = `/uploads/${filename}`;
          }
        } catch (fileErr) {
          console.warn("Could not save to public/uploads disk, using data URL fallback:", fileErr);
          // Keep imageUrl as data URL so it still succeeds in DB
        }
      }
    } else {
      // Multipart Form Data
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const positionStr = formData.get("position")?.toString() || "0";
      position = parseInt(positionStr, 10) || 0;
      title = (formData.get("title")?.toString() || "").trim();

      if (!file) {
        return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      try {
        const uploadDir = path.join(process.cwd(), "public/uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const rawName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, "") : "photo.jpg";
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `${uniqueSuffix}-${rawName || "photo.jpg"}`;
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);
        imageUrl = `/uploads/${filename}`;
      } catch (fileErr) {
        console.warn("Disk write failed, falling back to base64 data URL:", fileErr);
        const mimeType = file.type || "image/jpeg";
        const base64 = buffer.toString("base64");
        imageUrl = `data:${mimeType};base64,${base64}`;
      }
    }

    if (!imageUrl) {
      return NextResponse.json({ error: "Could not process image." }, { status: 400 });
    }

    const media = await prisma.homeMedia.create({
      data: {
        imageUrl,
        title,
        position,
        updatedBy: session.user.id || session.user.email || "admin",
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error: any) {
    console.error("Home media upload route error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload media. Please try again." },
      { status: 500 }
    );
  }
}

