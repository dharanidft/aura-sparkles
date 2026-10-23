import { NextResponse } from "next/server";
import { getAuthenticatedCustomerFromRequest } from "@/lib/session";
import { setDefaultCustomerAddress, getCustomerAddresses, getAddressById } from "@/lib/customer-store";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: { addressId: string } }
) {
  const session = getAuthenticatedCustomerFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  const { addressId } = params;
  if (!addressId) {
    return NextResponse.json({ error: "Address ID is required." }, { status: 400 });
  }

  const existing = getAddressById(addressId, session.uid);
  if (!existing) {
    return NextResponse.json({ error: "Address not found or permission denied." }, { status: 404 });
  }

  const success = setDefaultCustomerAddress(addressId, session.uid);
  if (!success) {
    return NextResponse.json({ error: "Failed to update default address." }, { status: 500 });
  }

  const updatedAddresses = getCustomerAddresses(session.uid);
  return NextResponse.json({
    success: true,
    message: "Default delivery address updated.",
    addresses: updatedAddresses,
  });
}
