import { NextResponse } from "next/server";
import { getAllStoredOrders, getStoredOrderById, saveStoredOrder } from "@/lib/order-store";
import { OrderPaymentStatus } from "@/lib/upi-types";

export const runtime = "nodejs";

function checkAdminAuth(request: Request): boolean {
  const authHeader = request.headers.get("x-admin-passcode");
  const validPasscode = process.env.ADMIN_PASSCODE || "aura2026";
  return !!authHeader && authHeader.trim() === validPasscode.trim();
}

// GET all orders for admin dashboard
export async function GET(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized. Valid admin credentials required." }, { status: 401 });
  }

  const orders = getAllStoredOrders();
  return NextResponse.json({
    success: true,
    orders,
  });
}

// PATCH to update payment status and verification
export async function PATCH(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized. Valid admin credentials required." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { orderId, newPaymentStatus, verificationNote, adminName } = body;

    if (!orderId || !newPaymentStatus) {
      return NextResponse.json({ error: "Order ID and new payment status are required." }, { status: 400 });
    }

    const order = getStoredOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const validStatuses: OrderPaymentStatus[] = [
      "PENDING_PAYMENT",
      "PAYMENT_REVIEW",
      "PAID",
      "PAYMENT_REJECTED",
      "PAYMENT_EXPIRED",
      "REFUNDED",
    ];

    if (!validStatuses.includes(newPaymentStatus)) {
      return NextResponse.json({ error: `Invalid payment status: ${newPaymentStatus}` }, { status: 400 });
    }

    const now = new Date().toISOString();
    const previousStatus = order.paymentStatus;
    const author = adminName || "Administrator";

    order.paymentStatus = newPaymentStatus;
    order.updatedAt = now;

    if (newPaymentStatus === "PAID") {
      order.orderStatus = "Confirmed";
    }

    if (order.proof) {
      order.proof.verificationNote = verificationNote || order.proof.verificationNote;
      if (newPaymentStatus === "PAID") {
        order.proof.verificationStatus = "VERIFIED";
        order.proof.verifiedBy = author;
        order.proof.verifiedAt = now;
      } else if (newPaymentStatus === "PAYMENT_REJECTED") {
        order.proof.verificationStatus = "REJECTED";
        order.proof.verifiedBy = author;
        order.proof.verifiedAt = now;
      }
    }

    if (!order.adminAuditLog) {
      order.adminAuditLog = [];
    }

    order.adminAuditLog.push({
      action: `PAYMENT_STATUS_CHANGED_TO_${newPaymentStatus}`,
      admin: author,
      timestamp: now,
      previousStatus,
      newStatus: newPaymentStatus,
      reason: verificationNote || `Status updated by ${author}`,
    });

    saveStoredOrder(order);

    console.log(`[Admin Payment Verification] Order ${orderId} changed from ${previousStatus} -> ${newPaymentStatus} by ${author}`);

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      previousStatus,
      newPaymentStatus,
      updatedAt: now,
      order,
    });
  } catch (error: any) {
    console.error("[Admin Payment Verification] Error updating order:", error);
    return NextResponse.json({ error: error.message || "Failed to update order status." }, { status: 500 });
  }
}
