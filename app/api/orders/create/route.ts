import { NextResponse } from "next/server";
import { INITIAL_PRODUCTS, AVAILABLE_COUPONS } from "@/lib/products-data";
import { calculateOrderTotals } from "@/lib/shipping";
import { generateAuraOrderId, generateAccessKey, saveStoredOrder } from "@/lib/order-store";
import { StoredOrder } from "@/lib/upi-types";
import { ShippingAddress } from "@/lib/types";
import { sanitizeText, sanitizeEmail, sanitizePhone } from "@/lib/sanitize";
import { checkRateLimit, getClientIp, createRateLimitResponse } from "@/lib/rate-limit";
import { getAuthenticatedCustomerFromRequest } from "@/lib/session";
import { dispatchOrderWhatsAppNotification } from "@/lib/whatsapp-notifications";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`order-create:${ip}`, "checkout");
  if (!rl.allowed) {
    return createRateLimitResponse(rl.limit, rl.resetSeconds, "Too many orders created. Please wait before creating another order.");
  }

  try {
    const session = getAuthenticatedCustomerFromRequest(request);
    const body = await request.json().catch(() => ({}));
    const { items, couponCode, shippingAddress } = body;

    // Security: NEVER trust frontend UID. Only use verified session UID.
    const authenticatedUid = session?.uid || undefined;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Shopping bag is empty." }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.pincode) {
      return NextResponse.json({ error: "Customer shipping details are incomplete." }, { status: 400 });
    }

    // 1. Server-side validation of cart items & price calculation against authoritative catalogue
    let subtotalPaise = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = INITIAL_PRODUCTS.find((p) => p.id === item.product?.id);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found in official catalogue: ${item.product?.name || "Unknown item"}` },
          { status: 400 }
        );
      }
      if (!product.inStock || product.stockCount < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient inventory for ${product.name}. Available: ${product.stockCount}` },
          { status: 400 }
        );
      }
      const itemPricePaise = Math.round(product.price * 100);
      subtotalPaise += itemPricePaise * item.quantity;

      validatedItems.push({
        product: {
          ...product,
          // Guarantee authoritative price from server
          price: product.price,
        },
        quantity: item.quantity,
        selectedVariant: item.selectedVariant || product.sizeVariant,
      });
    }

    // 2. Server-side coupon verification
    let discountPaise = 0;
    const subtotalRupees = Math.round(subtotalPaise / 100);

    if (couponCode) {
      const coupon = AVAILABLE_COUPONS.find((c) => c.code === couponCode.toUpperCase());
      if (coupon && subtotalRupees >= coupon.minOrderValue) {
        if (coupon.type === "percentage") {
          discountPaise = Math.round((subtotalPaise * coupon.value) / 100);
        } else {
          discountPaise = coupon.value * 100;
        }
      }
    }

    const discountRupees = Math.round(discountPaise / 100);

    // 3. Centralized shipping fee calculation
    const orderTotals = calculateOrderTotals(subtotalRupees, discountRupees);
    const shippingPaise = orderTotals.shippingFee * 100;
    const totalPaise = orderTotals.finalTotal * 100;

    // 4. Generate unique sequential Order ID (e.g. AURA-2026-000125) and secret accessKey
    const orderId = generateAuraOrderId();
    const accessKey = generateAccessKey();
    const now = new Date().toISOString();

    const addressSnapshot: ShippingAddress = {
      fullName: sanitizeText(shippingAddress.fullName, 100),
      email: sanitizeEmail(shippingAddress.email) || "",
      phone: sanitizePhone(shippingAddress.phone) || sanitizeText(shippingAddress.phone, 15),
      addressLine1: sanitizeText(shippingAddress.addressLine1, 200),
      addressLine2: sanitizeText(shippingAddress.addressLine2, 200),
      landmark: sanitizeText(shippingAddress.landmark, 150),
      city: sanitizeText(shippingAddress.city, 100),
      state: sanitizeText(shippingAddress.state, 100),
      pincode: (shippingAddress.pincode || "").replace(/\D/g, "").slice(0, 6),
    };

    const storedOrder: any = {
      orderId,
      customerUid: authenticatedUid,
      customerDetails: addressSnapshot,
      deliveryAddressSnapshot: addressSnapshot,
      items: validatedItems,
      subtotalPaise,
      shippingPaise,
      discountPaise,
      totalPaise,
      currency: "INR",
      paymentMethod: "UPI",
      paymentStatus: "PENDING_PAYMENT",
      orderStatus: "Pending",
      createdAt: now,
      updatedAt: now,
      accessKey,
    };

    saveStoredOrder(storedOrder);

    // Asynchronously trigger ORDER_PLACED WhatsApp notification
    dispatchOrderWhatsAppNotification("ORDER_PLACED", storedOrder).catch((err) => {
      console.warn("[Aura Orders] Background WhatsApp ORDER_PLACED notification failed:", err.message);
    });

    console.log(`[Aura Orders] New Order Created: ${orderId} (Total: ₹${orderTotals.finalTotal}, Status: PENDING_PAYMENT)`);

    return NextResponse.json({
      success: true,
      orderId,
      accessKey,
      totalPaise,
      totalRupees: orderTotals.finalTotal,
      currency: "INR",
      paymentStatus: "PENDING_PAYMENT",
      paymentUrl: `/pay/${orderId}?key=${accessKey}`,
    });
  } catch (error: any) {
    console.error("[Aura Orders] Error creating order:", error);
    return NextResponse.json({ error: error.message || "Failed to create order." }, { status: 500 });
  }
}
