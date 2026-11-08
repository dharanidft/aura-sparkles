import { NextResponse } from "next/server";
import { getAllStoredOrders, saveStoredOrder } from "@/lib/order-store";
import { verifyUpiGatewayWebhookSignature, getUpiGatewayConfig } from "@/lib/upi-gateway";
import { dispatchOrderWhatsAppNotification } from "@/lib/whatsapp-notifications";
import { OrderAuditLogEntry } from "@/lib/upi-types";

export const runtime = "nodejs";

/**
 * Official Webhook Receiver for Self-Hosted UPI Gateway (upi-gateway-main).
 * Verifies HMAC-SHA256 signature in X-Signature header before processing events.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature") || request.headers.get("X-Signature");

    const config = getUpiGatewayConfig();

    // Verify webhook authenticity
    if (config.webhookSecret) {
      const isValid = verifyUpiGatewayWebhookSignature(rawBody, signature);
      if (!isValid) {
        console.warn("[UPI Gateway Webhook] Invalid HMAC-SHA256 signature detected.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
      console.warn("[UPI Gateway Webhook] Warning: UPI_GATEWAY_WEBHOOK_SECRET is not configured.");
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { event, data } = payload;
    if (!event || !data) {
      return NextResponse.json({ error: "Missing event or data payload" }, { status: 400 });
    }

    const clientOrderId = data.client_order_id;
    const gatewayOrderId = data.order_id;
    const utr = data.utr || data.submitted_utr || null;
    const amount = data.amount;

    console.log(`[UPI Gateway Webhook] Event '${event}' received for order '${clientOrderId || gatewayOrderId}'`);

    const orders = getAllStoredOrders();
    const order = orders.find(
      (o) =>
        (clientOrderId && o.orderId.toUpperCase() === clientOrderId.toUpperCase()) ||
        (gatewayOrderId && o.gatewayOrderId === gatewayOrderId)
    );

    if (!order) {
      console.warn(`[UPI Gateway Webhook] Order '${clientOrderId || gatewayOrderId}' not found in store.`);
      // Return 200 so gateway doesn't continuously retry unfindable test orders
      return NextResponse.json({ success: true, message: "Order not found in store" });
    }

    const now = new Date().toISOString();
    const auditEntry: OrderAuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: now,
      action: `UPI_GATEWAY_WEBHOOK_${event.toUpperCase().replace(/\./g, "_")}`,
      changedByRole: "SYSTEM",
      author: "UPI Gateway Webhook",
      previousStatus: `${order.orderStatus} / ${order.paymentStatus}`,
      newStatus: "",
      notes: `Webhook event '${event}' processed. UTR: ${utr || "N/A"}`,
      metadata: { event, gatewayOrderId, amount, utr },
    };

    if (event === "order.paid") {
      const previousPaymentStatus = order.paymentStatus;
      order.paymentStatus = "PAID";
      order.orderStatus = "Confirmed";
      order.gatewayStatus = "paid";
      order.updatedAt = now;

      if (!order.proof) {
        order.proof = {
          orderId: order.orderId,
          transactionReference: utr || `GW-${gatewayOrderId || Date.now()}`,
          screenshotStoragePath: "",
          screenshotFileName: "verified_via_upi_gateway",
          screenshotMimeType: "application/json",
          fileSizeBytes: 0,
          submittedAt: now,
          verificationStatus: "VERIFIED",
          verifiedBy: "UPI_GATEWAY_WEBHOOK",
          verifiedAt: now,
          verificationNote: `Automated instant payment verification via UPI Gateway (${gatewayOrderId})`,
        };
      } else {
        order.proof.verificationStatus = "VERIFIED";
        order.proof.verifiedBy = "UPI_GATEWAY_WEBHOOK";
        order.proof.verifiedAt = now;
        if (utr) order.proof.transactionReference = utr;
      }

      auditEntry.newStatus = "Confirmed / PAID";
      order.auditTrail = order.auditTrail || [];
      order.auditTrail.push(auditEntry);

      saveStoredOrder(order);

      // Only fire notification if transitioning from non-paid
      if (previousPaymentStatus !== "PAID" && previousPaymentStatus !== "CONFIRMED") {
        dispatchOrderWhatsAppNotification("PAYMENT_VERIFIED", order).catch((err) => {
          console.warn("[UPI Gateway Webhook] WhatsApp notification error:", err.message);
        });
      }
    } else if (event === "order.under_review") {
      order.paymentStatus = "PAYMENT_REVIEW";
      order.gatewayStatus = "review";
      order.updatedAt = now;
      if (utr && !order.proof) {
        order.proof = {
          orderId: order.orderId,
          transactionReference: utr,
          screenshotStoragePath: "",
          screenshotFileName: "submitted_via_upi_gateway",
          screenshotMimeType: "application/json",
          fileSizeBytes: 0,
          submittedAt: now,
          verificationStatus: "PENDING",
          verificationNote: "UTR submitted on UPI Gateway. Awaiting admin manual review.",
        };
      }
      auditEntry.newStatus = `${order.orderStatus} / PAYMENT_REVIEW`;
      order.auditTrail = order.auditTrail || [];
      order.auditTrail.push(auditEntry);
      saveStoredOrder(order);
    } else if (event === "order.expired") {
      if (order.paymentStatus === "PENDING_PAYMENT") {
        order.paymentStatus = "PAYMENT_EXPIRED";
        order.gatewayStatus = "expired";
        order.updatedAt = now;
        auditEntry.newStatus = `${order.orderStatus} / PAYMENT_EXPIRED`;
        order.auditTrail = order.auditTrail || [];
        order.auditTrail.push(auditEntry);
        saveStoredOrder(order);
      }
    }

    return NextResponse.json({
      success: true,
      received: true,
      orderId: order.orderId,
      status: order.paymentStatus,
    });
  } catch (error: any) {
    console.error("[UPI Gateway Webhook] Error processing webhook:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failure" }, { status: 500 });
  }
}
