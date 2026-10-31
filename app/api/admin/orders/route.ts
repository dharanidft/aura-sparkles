import { NextResponse } from "next/server";
import crypto from "crypto";
import { 
  getAllStoredOrders, 
  getStoredOrderById, 
  saveStoredOrder, 
  generateAuraOrderId, 
  generateAccessKey 
} from "@/lib/order-store";
import { 
  OrderPaymentStatus, 
  OrderLifecycleStatus, 
  StoredOrder, 
  ShipmentDetails,
  OrderAuditLogEntry 
} from "@/lib/upi-types";
import { verifyAdminRequest } from "@/lib/security";
import { logAdminAction } from "@/lib/audit-logger";
import { getClientIp } from "@/lib/rate-limit";
import { 
  dispatchOrderWhatsAppNotification, 
  getAllWhatsAppMessages 
} from "@/lib/whatsapp-notifications";
import { getAllCustomers } from "@/lib/customer-store";
import { INITIAL_PRODUCTS } from "@/lib/products-data";

export const runtime = "nodejs";

// GET all orders, messages, or customer CRM records
export async function GET(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized. Valid admin credentials required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "whatsapp_messages") {
    const messages = getAllWhatsAppMessages();
    return NextResponse.json({ success: true, messages });
  }

  if (type === "customers") {
    const rawCustomers = getAllCustomers();
    const orders = getAllStoredOrders();

    // Compute live CRM metrics for each customer
    const customersWithMetrics = rawCustomers.map((cust) => {
      const customerOrders = orders.filter((o) => {
        const orderPhone = (o.customerDetails?.phone || "").replace(/\D/g, "");
        const custPhone = (cust.phoneNumber || "").replace(/\D/g, "");
        return (
          (o.customerUid && o.customerUid === cust.uid) ||
          (custPhone.length >= 10 && orderPhone.endsWith(custPhone.slice(-10))) ||
          (cust.email && o.customerDetails?.email?.toLowerCase() === cust.email.toLowerCase())
        );
      });

      const totalSpentPaise = customerOrders
        .filter((o) => o.paymentStatus === "PAID" || o.paymentStatus === "CONFIRMED")
        .reduce((sum, o) => sum + (o.totalPaise || 0), 0);

      const sorted = [...customerOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const lastOrderAt = sorted[0]?.createdAt || cust.createdAt;

      return {
        ...cust,
        orderCount: customerOrders.length,
        totalSpentPaise,
        lastOrderAt,
        latestOrderId: sorted[0]?.orderId,
      };
    });

    return NextResponse.json({ success: true, customers: customersWithMetrics });
  }

  const orders = getAllStoredOrders();
  return NextResponse.json({
    success: true,
    orders,
  });
}

// POST to create a manual order (e.g. from Instagram, WhatsApp, Studio walk-in)
export async function POST(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized. Valid admin credentials required." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { 
      customerDetails, 
      items, 
      paymentMethod = "UPI", 
      paymentStatus = "CONFIRMED", 
      orderStatus = "Confirmed", 
      source = "INSTAGRAM",
      notes,
      discountPaise = 0,
      shippingPaise = 0,
      sendWhatsAppNotification = true
    } = body;

    if (!customerDetails || !customerDetails.fullName || !customerDetails.phone) {
      return NextResponse.json({ error: "Customer name and phone number are required." }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one order product must be selected." }, { status: 400 });
    }

    // Build validated items
    let subtotalPaise = 0;
    const validatedItems = [];

    for (const item of items) {
      const p = INITIAL_PRODUCTS.find((prod) => prod.id === item.productId || prod.id === item.product?.id);
      const unitPrice = item.unitPrice || p?.price || 249;
      const unitPricePaise = Math.round(unitPrice * 100);
      const qty = Math.max(1, parseInt(item.quantity || 1, 10));
      subtotalPaise += unitPricePaise * qty;

      const baseProduct = p || INITIAL_PRODUCTS[0];
      const productObj = {
        ...baseProduct,
        id: item.productId || baseProduct.id,
        name: item.name || baseProduct.name,
        price: unitPrice,
      };

      validatedItems.push({
        product: productObj,
        quantity: qty,
        selectedVariant: item.selectedVariant || productObj.sizeVariant || "Standard",
      });
    }

    const totalPaise = Math.max(0, subtotalPaise + shippingPaise - discountPaise);
    const orderId = generateAuraOrderId();
    const accessKey = generateAccessKey();
    const now = new Date().toISOString();

    const storedOrder: StoredOrder = {
      orderId,
      customerDetails: {
        fullName: customerDetails.fullName,
        email: customerDetails.email || "",
        phone: customerDetails.phone,
        addressLine1: customerDetails.addressLine1 || "Studio Direct Pickup / Not specified",
        addressLine2: customerDetails.addressLine2 || "",
        landmark: customerDetails.landmark || "",
        city: customerDetails.city || "Chennai",
        state: customerDetails.state || "Tamil Nadu",
        pincode: (customerDetails.pincode || "600095").replace(/\D/g, "").slice(0, 6),
      },
      items: validatedItems,
      subtotalPaise,
      shippingPaise,
      discountPaise,
      totalPaise,
      currency: "INR",
      paymentMethod,
      paymentStatus: paymentStatus as OrderPaymentStatus,
      orderStatus: orderStatus as OrderLifecycleStatus,
      source,
      createdAt: now,
      updatedAt: now,
      accessKey,
      auditTrail: [
        {
          id: `AUDIT-${crypto.randomBytes(4).toString("hex")}`,
          timestamp: now,
          action: "MANUAL_ORDER_CREATED",
          changedByRole: "ADMIN",
          author: auth.username,
          newStatus: orderStatus,
          notes: notes || `Manual order created via Admin Dashboard (Source: ${source})`,
        },
      ],
      adminAuditLog: [
        {
          action: "MANUAL_ORDER_CREATED",
          admin: auth.username,
          timestamp: now,
          previousStatus: "PENDING_PAYMENT",
          newStatus: paymentStatus as OrderPaymentStatus,
          reason: `Manual order created (Source: ${source})`,
        },
      ],
    };

    saveStoredOrder(storedOrder);

    logAdminAction({
      action: "MANUAL_ORDER_CREATED",
      adminUser: auth.username,
      ip: getClientIp(request),
      targetResource: `order:${orderId}`,
      details: { source, totalPaise, customerPhone: customerDetails.phone },
    });

    // Optionally dispatch WhatsApp notification
    if (sendWhatsAppNotification) {
      const notifType = (paymentStatus === "CONFIRMED" || paymentStatus === "PAID") ? "PAYMENT_VERIFIED" : "ORDER_PLACED";
      dispatchOrderWhatsAppNotification(notifType, storedOrder).catch((err) => {
        console.warn("[Admin Manual Order] WhatsApp dispatch failed:", err.message);
      });
    }

    return NextResponse.json({
      success: true,
      message: `Manual order ${orderId} created successfully.`,
      order: storedOrder,
    });
  } catch (error: any) {
    console.error("[Admin Manual Order] Error creating order:", error);
    return NextResponse.json({ error: error.message || "Failed to create manual order." }, { status: 500 });
  }
}

// PATCH to update payment status, order lifecycle, verification, or shipment
export async function PATCH(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized. Valid admin credentials required." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { 
      orderId, 
      newPaymentStatus, 
      newOrderStatus, 
      verificationNote, 
      adminName, 
      shipment 
    } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const order = getStoredOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const now = new Date().toISOString();
    const author = adminName || auth.username || "Administrator";
    const previousPaymentStatus = order.paymentStatus;
    const previousOrderStatus = order.orderStatus;
    let paymentVerifiedJustNow = false;
    let orderStatusChanged = false;

    // 1. Payment status transition
    if (newPaymentStatus && newPaymentStatus !== previousPaymentStatus) {
      order.paymentStatus = newPaymentStatus as OrderPaymentStatus;
      
      // If payment is approved/verified, automatically advance orderStatus to CONFIRMED
      if (newPaymentStatus === "PAID" || newPaymentStatus === "CONFIRMED") {
        order.orderStatus = "CONFIRMED";
        paymentVerifiedJustNow = true;
      }

      if (order.proof) {
        order.proof.verificationNote = verificationNote || order.proof.verificationNote;
        if (newPaymentStatus === "PAID" || newPaymentStatus === "CONFIRMED") {
          order.proof.verificationStatus = "VERIFIED";
          order.proof.verifiedBy = author;
          order.proof.verifiedAt = now;
        } else if (newPaymentStatus === "PAYMENT_REJECTED") {
          order.proof.verificationStatus = "REJECTED";
          order.proof.verifiedBy = author;
          order.proof.verifiedAt = now;
        }
      }
    }

    // 2. Order lifecycle transition
    if (newOrderStatus && newOrderStatus !== previousOrderStatus) {
      order.orderStatus = newOrderStatus as OrderLifecycleStatus;
      orderStatusChanged = true;
    }

    // 3. Shipment assignment / update
    if (shipment) {
      order.shipment = {
        courierName: shipment.courierName || "Shiprocket",
        awbNumber: shipment.awbNumber || "",
        trackingUrl: shipment.trackingUrl || "",
        shippedAt: shipment.shippedAt || now,
        pickupScheduledAt: shipment.pickupScheduledAt,
        estimatedDeliveryDate: shipment.estimatedDeliveryDate,
        deliveredAt: shipment.deliveredAt,
        currentCourierStatus: shipment.currentCourierStatus || "In Transit",
      };
      if (newOrderStatus !== "DELIVERED") {
        order.orderStatus = "SHIPPED";
        orderStatusChanged = true;
      }
    }

    order.updatedAt = now;

    // 4. Record audit entry
    if (!order.auditTrail) {
      order.auditTrail = [];
    }
    const auditEntry: OrderAuditLogEntry = {
      id: `AUDIT-${crypto.randomBytes(4).toString("hex")}`,
      timestamp: now,
      action: `STATUS_CHANGE_${order.orderStatus}`,
      changedByRole: "ADMIN",
      author,
      previousStatus: `${previousOrderStatus} / ${previousPaymentStatus}`,
      newStatus: `${order.orderStatus} / ${order.paymentStatus}`,
      reason: verificationNote || `Updated by ${author}`,
      notes: verificationNote,
      metadata: { newPaymentStatus, newOrderStatus, shipment },
    };
    order.auditTrail.unshift(auditEntry);

    // Keep legacy adminAuditLog populated for backwards compatibility
    if (!order.adminAuditLog) order.adminAuditLog = [];
    order.adminAuditLog.push({
      action: `STATUS_CHANGED_TO_${order.orderStatus}`,
      admin: author,
      timestamp: now,
      previousStatus: previousPaymentStatus,
      newStatus: order.paymentStatus,
      reason: verificationNote || `Updated by ${author}`,
    });

    saveStoredOrder(order);

    logAdminAction({
      action: `ORDER_UPDATED_${order.orderId}`,
      adminUser: author,
      ip: getClientIp(request),
      targetResource: `order:${orderId}`,
      details: { 
        previousOrderStatus, 
        newOrderStatus: order.orderStatus, 
        previousPaymentStatus, 
        newPaymentStatus: order.paymentStatus,
        verificationNote 
      },
    });

    // 5. WhatsApp Event-Driven Trigger
    // Payment verified notification fires ONLY when payment status changed to PAID / CONFIRMED
    if (paymentVerifiedJustNow) {
      dispatchOrderWhatsAppNotification("PAYMENT_VERIFIED", order, { notes: verificationNote }).catch((err) => {
        console.warn("[Admin WhatsApp Event] PAYMENT_VERIFIED notification error:", err.message);
      });
    } else if (orderStatusChanged) {
      if (order.orderStatus === "PACKED") {
        dispatchOrderWhatsAppNotification("ORDER_PACKED", order).catch((err) => {
          console.warn("[Admin WhatsApp Event] ORDER_PACKED notification error:", err.message);
        });
      } else if (order.orderStatus === "SHIPPED") {
        dispatchOrderWhatsAppNotification("COURIER_DISPATCHED", order, {
          courier: order.shipment?.courierName,
          awb: order.shipment?.awbNumber,
          trackingUrl: order.shipment?.trackingUrl,
        }).catch((err) => {
          console.warn("[Admin WhatsApp Event] COURIER_DISPATCHED notification error:", err.message);
        });
      } else if (order.orderStatus === "OUT_FOR_DELIVERY") {
        dispatchOrderWhatsAppNotification("OUT_FOR_DELIVERY", order).catch((err) => {
          console.warn("[Admin WhatsApp Event] OUT_FOR_DELIVERY notification error:", err.message);
        });
      } else if (order.orderStatus === "DELIVERED") {
        dispatchOrderWhatsAppNotification("DELIVERED", order).catch((err) => {
          console.warn("[Admin WhatsApp Event] DELIVERED notification error:", err.message);
        });
      }
    }

    console.log(`[Admin Order Update] ${orderId}: Payment=${order.paymentStatus}, Lifecycle=${order.orderStatus} by ${author}`);

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      order,
    });
  } catch (error: any) {
    console.error("[Admin Order Update] Error updating order:", error);
    return NextResponse.json({ error: error.message || "Failed to update order status." }, { status: 500 });
  }
}
