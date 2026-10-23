import { NextResponse } from "next/server";
import { getAuthenticatedCustomerFromRequest } from "@/lib/session";
import { getAllStoredOrders } from "@/lib/order-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = getAuthenticatedCustomerFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  const allOrders = getAllStoredOrders();
  const cleanPhone = session.phoneNumber.replace(/\D/g, "").slice(-10);

  // Match by customer UID or matching phone number
  const customerOrders = allOrders.filter((order) => {
    const matchesUid = (order as any).customerUid === session.uid;
    const orderPhone = (order.customerDetails?.phone || "").replace(/\D/g, "").slice(-10);
    const matchesPhone = orderPhone === cleanPhone;
    return matchesUid || matchesPhone;
  });

  // Sort newest first
  customerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Format clean order response
  const sanitizedOrders = customerOrders.map((ord) => ({
    orderId: ord.orderId,
    createdAt: ord.createdAt,
    updatedAt: ord.updatedAt,
    items: ord.items,
    subtotalPaise: ord.subtotalPaise,
    shippingPaise: ord.shippingPaise,
    discountPaise: ord.discountPaise,
    totalPaise: ord.totalPaise,
    totalRupees: ord.totalPaise / 100,
    currency: ord.currency,
    paymentMethod: ord.paymentMethod,
    paymentStatus: ord.paymentStatus,
    orderStatus: ord.orderStatus,
    shippingAddress: (ord as any).deliveryAddressSnapshot || ord.customerDetails,
    accessKey: ord.accessKey,
    hasProof: !!ord.proof,
    proofSubmittedAt: ord.proof?.submittedAt,
    transactionReference: ord.proof?.transactionReference,
    verificationStatus: ord.proof?.verificationStatus,
    verificationNote: ord.proof?.verificationNote,
  }));

  return NextResponse.json({
    success: true,
    orders: sanitizedOrders,
  });
}
