import { NextResponse } from "next/server";
import { 
  findMatchingState, 
  PINCODE_PREFIX_MAP, 
  checkIndianPincode 
} from "@/lib/shipping";
import { checkRateLimit, getClientIp, createRateLimitResponse } from "@/lib/rate-limit";

export async function GET(
  request: Request,
  { params }: { params: { pincode: string } }
) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`pincode:${ip}`, { maxRequests: 30, windowMs: 60 * 1000 });
  if (!rl.allowed) {
    return createRateLimitResponse(rl.limit, rl.resetSeconds);
  }

  const rawPincode = params.pincode || "";
  const cleanPin = rawPincode.trim().replace(/\D/g, "");

  // 1. PIN code format validation: Indian PIN codes are exactly 6 digits and do not start with 0
  if (cleanPin.length !== 6 || cleanPin.startsWith("0")) {
    return NextResponse.json(
      {
        success: false,
        pincode: cleanPin,
        error: "Please enter a valid 6-digit Indian PIN code.",
      },
      { status: 400 }
    );
  }

  try {
    // 2. Fetch from Postal PIN code API with a 3.5-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const apiRes = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal,
      headers: { "Accept": "application/json" },
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (apiRes && apiRes.ok) {
      const data = await apiRes.json();
      if (Array.isArray(data) && data[0]?.Status === "Success" && Array.isArray(data[0]?.PostOffice)) {
        const postOffices = data[0].PostOffice;
        const first = postOffices[0];

        const rawDistrict = first.District || "";
        const rawState = first.State || "";
        const matchedState = findMatchingState(rawState) || rawState;
        
        // Extract distinct locality / branch names
        const localities: string[] = Array.from(
          new Set(
            postOffices
              .map((p: any) => p.Name)
              .filter((name: any): name is string => typeof name === "string" && name.trim().length > 0)
          )
        );

        return NextResponse.json({
          success: true,
          pincode: cleanPin,
          city: rawDistrict,
          state: matchedState,
          localities,
          deliveryNotice: "PIN code found. Note: Final carrier serviceability will be re-confirmed at dispatch.",
        });
      }
    }
  } catch (err) {
    // Fallback to internal lookup on network error or timeout
  }

  // 3. Fallback to regional prefix map
  const prefix = cleanPin.substring(0, 2);
  const fallback = PINCODE_PREFIX_MAP[prefix];

  if (fallback) {
    return NextResponse.json({
      success: true,
      pincode: cleanPin,
      city: fallback.city,
      state: fallback.state,
      localities: [],
      deliveryNotice: "Regional hub identified. Final delivery feasibility confirmed during courier allocation.",
    });
  }

  // 4. Inconclusive lookup — allow manual entry
  return NextResponse.json({
    success: false,
    pincode: cleanPin,
    isInconclusive: true,
    message: "Lookup could not automatically detect your locality. Please enter your city and select your state manually.",
  });
}
