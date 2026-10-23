import { NextResponse } from "next/server";
import { getAuthenticatedCustomerFromRequest } from "@/lib/session";
import { getCustomerByUid, getCustomerAddresses } from "@/lib/customer-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = getAuthenticatedCustomerFromRequest(request);

    if (!session) {
      return NextResponse.json({ authenticated: false, customer: null, addresses: [] });
    }

    const customer = getCustomerByUid(session.uid);
    if (!customer || customer.accountStatus !== "ACTIVE") {
      return NextResponse.json({ authenticated: false, customer: null, addresses: [] });
    }

    const addresses = getCustomerAddresses(customer.uid);

    return NextResponse.json({
      authenticated: true,
      customer,
      addresses,
    });
  } catch (err: any) {
    console.error("[Aura Auth] Check session error:", err);
    return NextResponse.json({ authenticated: false, customer: null, addresses: [] });
  }
}
