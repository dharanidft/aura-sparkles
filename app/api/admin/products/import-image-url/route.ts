import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { verifyAdminRequest } from "@/lib/security";

export const runtime = "nodejs";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "products");

function normalizeExternalImageUrl(rawUrl: string): string {
  let url = rawUrl.trim();

  // Convert Google Drive sharing links to direct download links
  const gdriveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  if (gdriveMatch && gdriveMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${gdriveMatch[1]}`;
  }

  // Convert Dropbox links
  if (url.includes("dropbox.com") && url.includes("dl=0")) {
    return url.replace("dl=0", "raw=1");
  }

  return url;
}

export async function POST(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized. Valid admin credentials required." }, { status: 401 });
  }

  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const body = await request.json().catch(() => ({}));
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'url' in request body." }, { status: 400 });
    }

    const targetUrl = normalizeExternalImageUrl(url);

    // If it's already a local relative path, return immediately
    if (targetUrl.startsWith("/") || targetUrl.startsWith("/uploads/")) {
      return NextResponse.json({ success: true, url: targetUrl, isLocal: true });
    }

    // Fetch the remote image with browser headers to avoid anti-hotlinking blocks
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      console.warn(`[Image Import] Remote URL returned status ${response.status}: ${targetUrl}`);
      // Fallback: return the original URL so the user can still use it directly
      return NextResponse.json({
        success: false,
        fallbackUrl: targetUrl,
        message: `Remote server returned HTTP ${response.status}. Using direct web link instead.`,
      });
    }

    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    const arrayBuf = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    if (buffer.length < 50) {
      return NextResponse.json({
        success: false,
        fallbackUrl: targetUrl,
        message: "File returned is too small or empty. Using direct web link instead.",
      });
    }

    // Determine extension
    let ext = ".jpg";
    if (contentType.includes("png") || buffer.slice(0, 8).includes(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) {
      ext = ".png";
    } else if (contentType.includes("webp") || buffer.slice(8, 12).toString() === "WEBP") {
      ext = ".webp";
    } else if (contentType.includes("gif")) {
      ext = ".gif";
    } else if (contentType.includes("avif")) {
      ext = ".avif";
    }

    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const filename = `imported-${uniqueSuffix}${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    const localUrl = `/uploads/products/${filename}`;

    return NextResponse.json({
      success: true,
      url: localUrl,
      originalUrl: targetUrl,
      size: buffer.length,
    });
  } catch (err: any) {
    console.error("Failed to import image from URL:", err);
    return NextResponse.json({
      success: false,
      fallbackUrl: (await request.json().catch(() => ({})))?.url || "",
      message: err?.message || "Failed to download image",
    });
  }
}
