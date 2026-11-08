import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".bmp": "image/bmp",
};

function resolveUploadFilePath(pathSegments: string[]): string | null {
  const safeSubPath = pathSegments.map((s) => s.replace(/\.\./g, "")).join(path.sep);
  const uploadsBase = path.join(process.cwd(), "public", "uploads");
  const targetPath = path.resolve(uploadsBase, safeSubPath);

  if (!targetPath.startsWith(uploadsBase)) {
    return null;
  }

  // 1. Direct match check
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
    return targetPath;
  }

  // 2. Case-insensitive fallback
  const dir = path.dirname(targetPath);
  const baseName = path.basename(targetPath).toLowerCase();
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    try {
      const files = fs.readdirSync(dir);
      const match = files.find((f) => f.toLowerCase() === baseName);
      if (match) {
        const candidate = path.join(dir, match);
        if (fs.statSync(candidate).isFile()) {
          return candidate;
        }
      }
    } catch {
      // ignore directory read errors
    }
  }

  return null;
}

export async function GET(
  request: NextRequest,
  context: { params: { path: string[] } | Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const pathSegments = resolvedParams?.path;

    if (!pathSegments || !Array.isArray(pathSegments) || pathSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const finalFilePath = resolveUploadFilePath(pathSegments);
    if (!finalFilePath) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const ext = path.extname(finalFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const fileBuffer = fs.readFileSync(finalFilePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    console.error("Error serving uploaded file:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function HEAD(
  request: NextRequest,
  context: { params: { path: string[] } | Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const pathSegments = resolvedParams?.path;

    if (!pathSegments || !Array.isArray(pathSegments) || pathSegments.length === 0) {
      return new NextResponse(null, { status: 404 });
    }

    const finalFilePath = resolveUploadFilePath(pathSegments);
    if (!finalFilePath) {
      return new NextResponse(null, { status: 404 });
    }

    const ext = path.extname(finalFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const stats = fs.statSync(finalFilePath);

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stats.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
