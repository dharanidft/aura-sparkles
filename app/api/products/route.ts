import { NextResponse } from "next/server";
import { getAuthoritativeProducts } from "@/lib/product-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const products = getAuthoritativeProducts();
  return NextResponse.json(
    { success: true, products },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
}
