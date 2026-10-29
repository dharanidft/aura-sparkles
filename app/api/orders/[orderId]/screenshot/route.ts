import { NextResponse } from "next/server";
import fs from "fs";
import { getStoredOrderById } from "@/lib/order-store";
import { getAuthenticatedCustomerFromRequest } from "@/lib/session";
import { verifyAdminRequest, canAccessOrder } from "@/lib/security";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!orderId) {
      return NextResponse.json({ error: "Order ID missing." }, { status: 400 });
    }

    const order = getStoredOrderById(orderId);
    if (!order || !order.proof || !order.proof.screenshotStoragePath) {
      return NextResponse.json({ error: "No payment screenshot found for this order." }, { status: 404 });
    }

    // Authorization check: Require customer accessKey, customer ownership session, or verified admin
    const session = getAuthenticatedCustomerFromRequest(request);
    const adminAuth = verifyAdminRequest(request);

    if (!canAccessOrder(order, session, key, adminAuth.authorized)) {
      return NextResponse.json({ error: "Unauthorized access to payment screenshot." }, { status: 403 });
    }

    const filePath = order.proof.screenshotStoragePath;
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Screenshot file not found on server." }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const mime = order.proof.screenshotMimeType || "image/jpeg";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Cache-Control": "private, max-age=60",
        "Content-Disposition": `inline; filename="${order.proof.screenshotFileName || "payment_proof.jpg"}"`,
      },
    });
  } catch (error: any) {
    console.error("[Aura Orders] Error reading payment screenshot:", error);
    return NextResponse.json({ error: "Failed to load screenshot." }, { status: 500 });
  }
}
