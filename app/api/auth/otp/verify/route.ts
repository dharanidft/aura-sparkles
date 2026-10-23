import { NextResponse } from "next/server";
import { normalizePhoneNumber, verifyOtp } from "@/lib/otp-service";
import { 
  getCustomerByPhone, 
  saveCustomer, 
  generateCustomerUid, 
  getCustomerAddresses,
  linkOrdersToCustomer
} from "@/lib/customer-store";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/session";
import { Customer } from "@/lib/customer-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const phoneNumber = body.phoneNumber || body.phone;
    const otpCode = body.otpCode || body.otp;
    const countryCode = body.countryCode || "+91";
    const displayName = body.displayName;
    const firebasePhone = body.firebasePhone;
    const firebaseUid = body.firebaseUid;

    let targetPhone = "";

    // 1. Verification Mode: Firebase verified credentials passed from client
    if (firebasePhone) {
      targetPhone = normalizePhoneNumber(firebasePhone, countryCode);
    } else {
      // 2. Server OTP verification
      if (!phoneNumber || !otpCode) {
        return NextResponse.json(
          { error: "Phone number and 6-digit verification code are required." },
          { status: 400 }
        );
      }

      targetPhone = normalizePhoneNumber(phoneNumber, countryCode);
      const verification = verifyOtp(targetPhone, otpCode.toString().trim());

      if (!verification.valid) {
        return NextResponse.json(
          { error: verification.error || "Invalid verification code." },
          { status: 400 }
        );
      }
    }

    // 3. Retrieve or create customer profile
    const now = new Date().toISOString();
    let customer = getCustomerByPhone(targetPhone);
    let isNewCustomer = false;

    if (!customer) {
      isNewCustomer = true;
      const uid = firebaseUid || generateCustomerUid();
      customer = {
        uid,
        phoneNumber: targetPhone,
        displayName: (displayName || "").trim() || "Aura Customer",
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        accountStatus: "ACTIVE",
      };
      saveCustomer(customer);
    } else {
      // Existing customer login
      customer.lastLoginAt = now;
      if (displayName && (!customer.displayName || customer.displayName === "Aura Customer")) {
        customer.displayName = displayName.trim();
      }
      customer.updatedAt = now;
      saveCustomer(customer);
    }

    // 4. Link any past guest orders matching this mobile number
    linkOrdersToCustomer(customer.uid, customer.phoneNumber);

    // 5. Generate signed cryptographic session token
    const sessionToken = createSessionToken(customer.uid, customer.phoneNumber);

    // 6. Fetch saved addresses
    const addresses = getCustomerAddresses(customer.uid);

    // 7. Prepare response and set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      isNewCustomer,
      customer,
      addresses,
      sessionToken,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: "/",
    });

    console.log(`[Aura Auth] Customer authenticated: ${customer.uid} (${customer.phoneNumber})`);
    return response;
  } catch (err: any) {
    console.error("[Aura Auth] Verify OTP error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during verification." },
      { status: 500 }
    );
  }
}
