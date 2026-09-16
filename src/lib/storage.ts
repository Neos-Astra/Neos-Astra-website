// src/lib/storage.ts
// Persistent Cloud Storage using Supabase Storage REST API (Zero extra dependencies)
// Falls back gracefully to local public/uploads during local development

import path from "path";
import fs from "fs";
import { writeFile } from "fs/promises";

interface UploadOptions {
  bucket?: string;
  filename: string;
  buffer: Buffer;
  contentType: string;
}

export async function uploadPersistentFile({
  bucket = "home-media",
  filename,
  buffer,
  contentType,
}: UploadOptions): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

  // 1. If Supabase credentials exist, upload directly to Supabase Storage
  if (supabaseUrl && serviceKey) {
    try {
      const endpoint = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${bucket}/${filename}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: new Uint8Array(buffer),
      });

      if (response.ok) {
        // Return public CDN URL
        return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${filename}`;
      } else {
        const errText = await response.text();
        console.warn(`Supabase storage upload returned status ${response.status}:`, errText);
      }
    } catch (storageErr) {
      console.warn("Supabase storage upload failed, attempting local fallback:", storageErr);
    }
  }

  // 2. Local filesystem fallback (works on localhost development)
  try {
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    return `/uploads/${filename}`;
  } catch (fileErr) {
    console.warn("Local disk write failed (expected on Vercel serverless without persistent storage):", fileErr);
    // If running on Vercel without Supabase storage keys configured, use base64 data URL
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  }
}
