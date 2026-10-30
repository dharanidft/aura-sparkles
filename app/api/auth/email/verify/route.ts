import { NextResponse } from "next/server";
import { verifyEmailSignInToken } from "@/lib/email-auth-service";
import { 
  getCustomerByEmail, 
  saveCustomer, 
  generateCustomerUid, 
  getCustomerAddresses,
  linkOrdersToCustomer
} from "@/lib/customer-store";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/session";
import { Customer } from "@/lib/customer-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, token } = body;

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email address and sign-in token are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify token
    const verification = verifyEmailSignInToken(cleanEmail, token);
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || "Invalid or expired sign-in link." },
        { status: 400 }
      );
    }

    // Retrieve or create customer profile
    let customer = getCustomerByEmail(cleanEmail);
    const now = new Date().toISOString();
    let isNewCustomer = false;

    if (!customer) {
      isNewCustomer = true;
      const newUid = generateCustomerUid();
      customer = {
        uid: newUid,
        email: cleanEmail,
        emailVerified: true,
        displayName: cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        accountStatus: "ACTIVE",
      };
      saveCustomer(customer);
    } else {
      customer.lastLoginAt = now;
      customer.emailVerified = true;
      saveCustomer(customer);
    }

    // Link any previous guest orders placed with this email
    linkOrdersToCustomer(customer.uid, cleanEmail);

    // Create cryptographic session token
    const sessionToken = createSessionToken(customer.uid, cleanEmail, customer.phoneNumber);
    const addresses = getCustomerAddresses(customer.uid);

    const response = NextResponse.json({
      success: true,
      isNewCustomer,
      customer,
      addresses,
      sessionToken,
    });

    // Set secure HTTP-only session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("[Email Auth Verify] Error:", err);
    return NextResponse.json(
      { error: "Failed to verify sign-in link. Please request a new one." },
      { status: 500 }
    );
  }
}
