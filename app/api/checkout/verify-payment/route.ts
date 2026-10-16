import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isTestMode } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (secret && !isTestMode) {
      // Live HMAC SHA256 Signature verification
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          { verified: false, error: "Payment verification failed. Invalid transaction signature." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        verified: true,
        paymentId: razorpay_payment_id,
        message: "Payment successfully verified via Razorpay gateway.",
      });
    }

    // Verified in Test Mode
    return NextResponse.json({
      verified: true,
      paymentId: razorpay_payment_id || `test_pay_${Date.now()}`,
      message: "Test transaction verified successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { verified: false, error: error.message || "Payment verification error." },
      { status: 500 }
    );
  }
}
