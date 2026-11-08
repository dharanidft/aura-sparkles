import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/security";
import { testUpiGatewayConnection, getUpiGatewayConfig } from "@/lib/upi-gateway";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const adminAuth = verifyAdminRequest(request);
    if (!adminAuth.authorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const config = getUpiGatewayConfig();
    const result = await testUpiGatewayConnection();

    return NextResponse.json({
      success: result.connected,
      config: {
        enabled: config.enabled,
        url: config.url,
        environment: config.environment,
        hasApiKey: Boolean(config.apiKey),
        hasApiSecret: Boolean(config.apiSecret),
        hasWebhookSecret: Boolean(config.webhookSecret),
      },
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to test connection" },
      { status: 500 }
    );
  }
}
