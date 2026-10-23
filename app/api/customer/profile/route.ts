import { NextResponse } from "next/server";
import { getAuthenticatedCustomerFromRequest } from "@/lib/session";
import { getCustomerByUid, getCustomerByEmail, saveCustomer } from "@/lib/customer-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const session = getAuthenticatedCustomerFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { displayName, phoneNumber } = body;

    let customer = getCustomerByUid(session.uid);
    if (!customer && session.email) {
      customer = getCustomerByEmail(session.email);
    }

    if (!customer) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 404 });
    }

    if (displayName && typeof displayName === "string") {
      customer.displayName = displayName.trim();
    }

    if (phoneNumber !== undefined) {
      const cleanPhone = (phoneNumber || "").replace(/\D/g, "");
      customer.phoneNumber = cleanPhone ? cleanPhone.slice(-10) : undefined;
    }

    customer.updatedAt = new Date().toISOString();
    saveCustomer(customer);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      customer,
    });
  } catch (err: any) {
    console.error("[Aura Customer] Profile update error:", err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
