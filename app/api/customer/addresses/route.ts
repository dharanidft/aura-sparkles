import { NextResponse } from "next/server";
import { getAuthenticatedCustomerFromRequest } from "@/lib/session";
import { 
  getCustomerAddresses, 
  saveCustomerAddress, 
  generateAddressId,
  getAddressById
} from "@/lib/customer-store";
import { CustomerAddress, AddressType } from "@/lib/customer-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET all addresses for current customer
export async function GET(request: Request) {
  const session = getAuthenticatedCustomerFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  const addresses = getCustomerAddresses(session.uid);
  return NextResponse.json({ success: true, addresses });
}

// POST create or update an address
export async function POST(request: Request) {
  const session = getAuthenticatedCustomerFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const {
      addressId,
      recipientName,
      deliveryPhone,
      houseFlat,
      buildingApartment,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      postalCode,
      addressType = "Home",
      deliveryInstructions,
      isDefault = false,
    } = body;

    // Validation
    if (!recipientName || !recipientName.trim()) {
      return NextResponse.json({ error: "Recipient full name is required." }, { status: 400 });
    }

    const cleanPhone = (deliveryPhone || "").replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: "Please enter a valid 10-digit delivery mobile number." }, { status: 400 });
    }

    const cleanPin = (postalCode || "").replace(/\D/g, "");
    if (cleanPin.length !== 6 || cleanPin.startsWith("0")) {
      return NextResponse.json({ error: "Please enter a valid 6-digit Indian PIN code." }, { status: 400 });
    }

    if (!addressLine1 || !addressLine1.trim()) {
      return NextResponse.json({ error: "Address line 1 (Street/Area) is required." }, { status: 400 });
    }

    if (!city || !city.trim() || !state || !state.trim()) {
      return NextResponse.json({ error: "City and State are required." }, { status: 400 });
    }

    const validAddressTypes: AddressType[] = ["Home", "Work", "Other"];
    const type: AddressType = validAddressTypes.includes(addressType) ? addressType : "Home";

    const now = new Date().toISOString();
    let finalAddressId = addressId;

    if (finalAddressId) {
      // Verify ownership before updating existing address
      const existing = getAddressById(finalAddressId, session.uid);
      if (!existing) {
        return NextResponse.json({ error: "Address not found or unauthorized." }, { status: 404 });
      }
    } else {
      finalAddressId = generateAddressId();
    }

    const addressRecord: CustomerAddress = {
      addressId: finalAddressId,
      customerUid: session.uid,
      recipientName: recipientName.trim(),
      deliveryPhone: cleanPhone.slice(-10),
      houseFlat: (houseFlat || "").trim(),
      buildingApartment: (buildingApartment || "").trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: (addressLine2 || "").trim(),
      landmark: (landmark || "").trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: cleanPin,
      addressType: type,
      deliveryInstructions: (deliveryInstructions || "").trim(),
      isDefault: Boolean(isDefault),
      createdAt: now,
      updatedAt: now,
    };

    saveCustomerAddress(addressRecord);
    const updatedList = getCustomerAddresses(session.uid);

    return NextResponse.json({
      success: true,
      message: addressId ? "Address updated successfully." : "Address saved to address book.",
      address: addressRecord,
      addresses: updatedList,
    });
  } catch (err: any) {
    console.error("[Aura Customer] Save address error:", err);
    return NextResponse.json({ error: err.message || "Failed to save delivery address." }, { status: 500 });
  }
}
