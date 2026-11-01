import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { verifyAdminRequest } from "@/lib/security";

export const runtime = "nodejs";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "products");

export async function POST(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized. Valid admin credentials required." }, { status: 401 });
  }

  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided in 'file' field." }, { status: 400 });
    }

    // Validate mime type
    const mime = file.type.toLowerCase();
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowedMimes.includes(mime)) {
      return NextResponse.json(
        { error: `Unsupported image format (${mime}). Allowed formats: JPG, PNG, WebP, GIF, AVIF.` },
        { status: 400 }
      );
    }

    // Enforce 15MB limit
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Image file exceeds maximum limit of 15MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Compute extension safely
    const ext = path.extname(file.name).toLowerCase() || (mime === "image/png" ? ".png" : mime === "image/webp" ? ".webp" : ".jpg");
    const safeBaseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const filename = `${safeBaseName}-${uniqueSuffix}${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/products/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
    });
  } catch (err: any) {
    console.error("Failed to upload product image:", err);
    return NextResponse.json({ error: "Failed to upload image", details: err?.message }, { status: 500 });
  }
}
