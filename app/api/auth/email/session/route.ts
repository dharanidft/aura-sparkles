import { NextResponse } from "next/server";
import { 
  getCustomerByEmail, 
  saveCustomer, 
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
    const { uid, email, emailVerified = true, displayName } = body;

    if (!uid || !email) {
      return NextResponse.json(
        { error: "Firebase UID and email are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Retrieve or create customer profile
    let customer = getCustomerByEmail(cleanEmail);
    const now = new Date().toISOString();
    let isNewCustomer = false;

    if (!customer) {
      isNewCustomer = true;
      customer = {
        uid, // Use Firebase UID directly
        email: cleanEmail,
        emailVerified: Boolean(emailVerified),
        displayName: displayName || cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        accountStatus: "ACTIVE",
      };
      saveCustomer(customer);
    } else {
      // Update existing customer with Firebase UID if needed
      customer.uid = uid;
      customer.lastLoginAt = now;
      customer.emailVerified = true;
      if (displayName && !customer.displayName) {
        customer.displayName = displayName;
      }
      saveCustomer(customer);
    }

    // Link previous guest orders placed with this email
    linkOrdersToCustomer(customer.uid, cleanEmail);

    // Create session token and set cookie
    const sessionToken = createSessionToken(customer.uid, cleanEmail, customer.phoneNumber);
    const addresses = getCustomerAddresses(customer.uid);

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

    return response;
  } catch (err: any) {
    console.error("[Email Firebase Session] Error:", err);
    return NextResponse.json(
      { error: "Failed to establish authenticated session." },
      { status: 500 }
    );
  }
}
