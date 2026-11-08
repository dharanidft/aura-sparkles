import { NextResponse } from "next/server";
import { 
  getAuthoritativeProducts, 
  saveAuthoritativeProducts, 
  resetAuthoritativeProducts,
  updateAuthoritativeProduct 
} from "@/lib/product-store";
import { verifyAdminRequest } from "@/lib/security";
import { Product } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const products = getAuthoritativeProducts();
  return NextResponse.json({ success: true, products });
}

export async function PATCH(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized. Valid admin credentials required." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates || typeof updates !== "object") {
      return NextResponse.json({ error: "Invalid payload: 'id' and 'updates' object are required." }, { status: 400 });
    }

    const updated = updateAuthoritativeProduct(id, updates);
    if (!updated) {
      return NextResponse.json({ error: `Product with id '${id}' not found.` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully in authoritative catalog store.",
      product: updated,
    });
  } catch (err: any) {
    console.error("Failed to patch product:", err);
    return NextResponse.json({ error: "Failed to update product", details: err?.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized. Valid admin credentials required." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: "Invalid payload: 'products' array is required." }, { status: 400 });
    }

    saveAuthoritativeProducts(products as Product[]);

    return NextResponse.json({
      success: true,
      message: "Products saved successfully to authoritative catalog store.",
      count: products.length,
    });
  } catch (err: any) {
    console.error("Failed to save products:", err);
    return NextResponse.json({ error: "Failed to persist products", details: err?.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized. Valid admin credentials required." }, { status: 401 });
  }

  try {
    const defaults = resetAuthoritativeProducts();
    return NextResponse.json({
      success: true,
      message: "Catalog restored to default products.",
      products: defaults,
    });
  } catch (err: any) {
    console.error("Failed to reset catalog:", err);
    return NextResponse.json({ error: "Failed to reset catalog", details: err?.message }, { status: 500 });
  }
}
