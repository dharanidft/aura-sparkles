import { NextResponse } from "next/server";
import { getStoredOrderById, saveStoredOrder } from "@/lib/order-store";
import { getUpiConfig, generateUpiPaymentUri } from "@/lib/upi-config";
import { getAuthenticatedCustomerFromRequest } from "@/lib/session";
import { verifyAdminRequest, canAccessOrder } from "@/lib/security";
import { getUpiGatewayOrderStatus, getUpiGatewayConfig } from "@/lib/upi-gateway";
import { dispatchOrderWhatsAppNotification } from "@/lib/whatsapp-notifications";

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

    // Row-level security check: Stop IDOR attacks
    const session = getAuthenticatedCustomerFromRequest(request);
    const adminAuth = verifyAdminRequest(request);

    if (!canAccessOrder(order, session, key, adminAuth.authorized)) {
      return NextResponse.json({ error: "Unauthorized access to order." }, { status: 403 });
    }

    // If order is still pending and has a gateway reference, check status with UPI Gateway
    const gwConfig = getUpiGatewayConfig();
    if (gwConfig.enabled && gwConfig.isConfigured && order.paymentStatus === "PENDING_PAYMENT") {
      try {
        const gwLookupId = order.gatewayOrderId || order.orderId;
        const gwStatus = await getUpiGatewayOrderStatus(gwLookupId);
        if (gwStatus.success && gwStatus.status === "paid") {
          console.log(`[Aura Orders] Order ${order.orderId} verified as PAID by UPI Gateway!`);
          order.paymentStatus = "PAID";
          order.orderStatus = "Confirmed";
          order.gatewayStatus = "paid";
          if (gwStatus.utr && !order.proof) {
            order.proof = {
              orderId: order.orderId,
              transactionReference: gwStatus.utr,
              screenshotStoragePath: "",
              screenshotFileName: "verified_via_upi_gateway",
              screenshotMimeType: "application/json",
              fileSizeBytes: 0,
              submittedAt: new Date().toISOString(),
              verificationStatus: "VERIFIED",
              verifiedBy: "UPI_GATEWAY",
              verifiedAt: gwStatus.paidAt || new Date().toISOString(),
              verificationNote: `Automated instant verification via UPI Gateway (${gwStatus.gatewayOrderId || gwLookupId})`,
            };
          }
          saveStoredOrder(order);
          dispatchOrderWhatsAppNotification("PAYMENT_VERIFIED", order).catch((err) => {
            console.warn("[Aura Orders] WhatsApp notification error:", err.message);
          });
        }
      } catch (err: any) {
        console.warn("[Aura Orders] Gateway status polling notice:", err.message);
      }
    }

    const upiConfig = getUpiConfig();
    const amountRupees = order.totalPaise / 100;
    // Prefer gateway dynamic intent if provided; fallback to standard NPCI UPI URI
    const upiIntentUri = order.gatewayUpiIntent || generateUpiPaymentUri(amountRupees, order.orderId);

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
        gatewayOrderId: order.gatewayOrderId,
        gatewayStatus: order.gatewayStatus,
      },
      payment: {
        upiId: upiConfig.upiId,
        merchantName: upiConfig.merchantName,
        qrImageUrl: upiConfig.qrImageUrl,
        upiIntentUri,
        payableAmount: amountRupees,
        gatewayPaymentUrl: order.gatewayPaymentUrl,
        gatewayUpiIntent: order.gatewayUpiIntent,
      },
    });
  } catch (error: any) {
    console.error("[Aura Orders] Error fetching order:", error);
    return NextResponse.json({ error: "Failed to retrieve order." }, { status: 500 });
  }
}
