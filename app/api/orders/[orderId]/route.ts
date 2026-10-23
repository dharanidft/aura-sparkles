import { NextResponse } from "next/server";
import { getStoredOrderById } from "@/lib/order-store";
import { getUpiConfig, generateUpiPaymentUri } from "@/lib/upi-config";

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
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const order = getStoredOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Require matching accessKey for customer privacy, or admin authorization header
    const authHeader = request.headers.get("x-admin-passcode");
    const isAdmin = authHeader && authHeader === (process.env.ADMIN_PASSCODE || "aura2026");

    if (!isAdmin && order.accessKey !== key) {
      return NextResponse.json({ error: "Unauthorized access to order." }, { status: 403 });
    }

    const upiConfig = getUpiConfig();
    const amountRupees = order.totalPaise / 100;
    const upiIntentUri = generateUpiPaymentUri(amountRupees, order.orderId);

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.orderId,
        customerName: order.customerDetails.fullName,
        customerPhone: order.customerDetails.phone,
        customerEmail: order.customerDetails.email,
        totalPaise: order.totalPaise,
        totalRupees: amountRupees,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        itemsCount: order.items.reduce((acc, i) => acc + i.quantity, 0),
        hasProof: !!order.proof,
        proofSubmittedAt: order.proof?.submittedAt,
        transactionReference: order.proof?.transactionReference,
        verificationNote: order.proof?.verificationNote,
      },
      payment: {
        upiId: upiConfig.upiId,
        merchantName: upiConfig.merchantName,
        qrImageUrl: upiConfig.qrImageUrl,
        upiIntentUri,
        payableAmount: amountRupees,
      },
    });
  } catch (error: any) {
    console.error("[Aura Orders] Error fetching order:", error);
    return NextResponse.json({ error: "Failed to retrieve order." }, { status: 500 });
  }
}
