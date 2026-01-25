/**
 * Report Media Upload API
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const reportId = formData.get("reportId") as string;
    const fileType = formData.get("fileType") as string; // "photo", "video", "voice"

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes: Record<string, string[]> = {
      photo: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
      video: ["video/mp4", "video/quicktime", "video/x-msvideo"],
      voice: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm"],
    };

    if (!allowedTypes[fileType]?.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${fileType}` },
        { status: 400 }
      );
    }

    // Validate file size (10MB for photos/voice, 50MB for videos)
    const maxSize = fileType === "video" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds maximum (${maxSize / 1024 / 1024}MB)` },
        { status: 400 }
      );
    }

    // Create uploads directory
    const uploadsDir = join(process.cwd(), "public", "uploads", "reports", fileType);
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `${reportId || "temp"}-${timestamp}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return file URL
    const fileUrl = `/uploads/reports/${fileType}/${filename}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
