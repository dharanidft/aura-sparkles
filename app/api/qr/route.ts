import { NextResponse } from "next/server";
import QRCode from "qrcode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Self-Hosted High-Resolution QR Code Generator Endpoint.
 * Generates standalone PNG QR codes locally without external API dependencies.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get("data");
    const size = parseInt(searchParams.get("size") || "320", 10);
    const margin = parseInt(searchParams.get("margin") || "2", 10);

    if (!data) {
      return NextResponse.json({ error: "Missing 'data' query parameter" }, { status: 400 });
    }

    const clampedSize = Math.min(Math.max(size, 100), 1000);
    const clampedMargin = Math.min(Math.max(margin, 0), 10);

    const buffer = await QRCode.toBuffer(data, {
      type: "png",
      width: clampedSize,
      margin: clampedMargin,
      color: {
        dark: "#2A1824", // Aura deep brand plum
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error: any) {
    console.error("[QR API] Error generating QR code:", error);
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
