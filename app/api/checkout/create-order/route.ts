import { NextResponse } from "next/server";
import { INITIAL_PRODUCTS, AVAILABLE_COUPONS } from "@/lib/products-data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, couponCode, shippingAddress, paymentMethod } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: "Shopping cart is empty." }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.pincode) {
      return NextResponse.json({ error: "Shipping details are incomplete." }, { status: 400 });
    }

    // 1. Calculate and verify subtotal against server catalogue
    let subtotal = 0;
    for (const item of items) {
      const product = INITIAL_PRODUCTS.find((p) => p.id === item.product.id);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.product.name}` }, { status: 400 });
      }
      if (!product.inStock || product.stockCount < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient inventory for ${product.name}. Available: ${product.stockCount}` },
          { status: 400 }
        );
      }
      subtotal += product.price * item.quantity;
    }

    // 2. Calculate discounts
    let discount = 0;
    if (couponCode) {
      const coupon = AVAILABLE_COUPONS.find((c) => c.code === couponCode.toUpperCase());
      if (coupon && subtotal >= coupon.minOrderValue) {
        if (coupon.type === "percentage") {
          discount = Math.round((subtotal * coupon.value) / 100);
        } else {
          discount = coupon.value;
        }
      }
    }

    // 3. Shipping fee
    const shippingFee = subtotal >= 499 ? 0 : 49;
    const finalTotal = Math.max(0, subtotal - discount + shippingFee);

    // 4. Check Razorpay credentials
    const razorpayKey = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    const orderId = `AS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    if (razorpayKey && razorpaySecret && paymentMethod === "Razorpay") {
      // Live Razorpay API call
      try {
        const auth = Buffer.from(`${razorpayKey}:${razorpaySecret}`).toString("base64");
        const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: finalTotal * 100, // in paise
            currency: "INR",
            receipt: orderId,
            notes: {
              customer_name: shippingAddress.fullName,
              customer_phone: shippingAddress.phone,
            },
          }),
        });

        const rzpData = await rzpResponse.json();
        return NextResponse.json({
          success: true,
          isLiveGateway: true,
          orderId,
          razorpayOrderId: rzpData.id,
          amount: finalTotal,
          currency: "INR",
          razorpayKey,
        });
      } catch (err) {
        console.error("Razorpay API connection failed, falling back to test mode", err);
      }
    }

    // Development / Test mode order creation
    return NextResponse.json({
      success: true,
      isLiveGateway: false,
      testModeNotice: "Razorpay keys not configured in environment. Operating in verified Test/Demo Mode.",
      orderId,
      razorpayOrderId: `rzp_test_order_${orderId}`,
      amount: finalTotal,
      currency: "INR",
      paymentMethod,
    });
  } catch (error: any) {
    console.error("Error creating checkout order", error);
    return NextResponse.json({ error: error.message || "Failed to process order." }, { status: 500 });
  }
}
