import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") || formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "No valid image file received." },
        { status: 400 }
      );
    }

    // Validate mime type
    const mimeType = file.type || "";
    if (!mimeType.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Only image files are permitted." },
        { status: 400 }
      );
    }

    // Validate size (< 10MB)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size exceeds the 10MB limit." },
        { status: 400 }
      );
    }

    // Determine extension
    let ext = ".jpg";
    if (mimeType.includes("png")) ext = ".png";
    else if (mimeType.includes("webp")) ext = ".webp";
    else if (mimeType.includes("gif")) ext = ".gif";
    else if (mimeType.includes("svg")) ext = ".svg";
    else if (file.name) {
      const match = file.name.match(/\.[a-zA-Z0-9]+$/);
      if (match) ext = match[0].toLowerCase();
    }

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const fileName = `profile-${uniqueSuffix}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/profiles/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      message: "Image uploaded successfully.",
    });
  } catch (error) {
    console.error("[UPLOAD API ERROR]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error during upload." },
      { status: 500 }
    );
  }
}
