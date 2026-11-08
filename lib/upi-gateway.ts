import crypto from "crypto";

export interface UpiGatewayConfig {
  enabled: boolean;
  url: string;
  apiKey: string;
  apiSecret: string;
  webhookSecret: string;
  environment: "live" | "sandbox";
  isConfigured: boolean;
}

export interface CreateGatewayOrderParams {
  amountRupees: number;
  clientOrderId: string;
  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
  note?: string;
  redirectUrl?: string;
}

export interface GatewayOrderResult {
  success: boolean;
  gatewayOrderId?: string;
  clientOrderId?: string;
  paymentUrl?: string;
  upiIntent?: string;
  status?: string;
  environment?: string;
  expiresAt?: string;
  error?: string;
  raw?: any;
}

export interface GatewayStatusResult {
  success: boolean;
  gatewayOrderId?: string;
  clientOrderId?: string;
  status?: "pending" | "paid" | "review" | "expired" | "failed" | string;
  amount?: string | number;
  utr?: string | null;
  submittedUtr?: string | null;
  paidAt?: string | null;
  paymentUrl?: string;
  upiIntent?: string | null;
  error?: string;
}

/**
 * Returns current configuration for the self-hosted UPI Payment Gateway (upi-gateway-main).
 */
export function getUpiGatewayConfig(): UpiGatewayConfig {
  const url = (process.env.UPI_GATEWAY_URL || "http://localhost:8000").trim().replace(/\/+$/, "");
  const apiKey = (process.env.UPI_GATEWAY_API_KEY || "").trim();
  const apiSecret = (process.env.UPI_GATEWAY_API_SECRET || "").trim();
  const webhookSecret = (process.env.UPI_GATEWAY_WEBHOOK_SECRET || apiSecret).trim();
  const rawEnv = (process.env.UPI_GATEWAY_ENVIRONMENT || "sandbox").trim().toLowerCase();
  const environment = rawEnv === "live" ? "live" : "sandbox";
  
  const enabled = process.env.UPI_GATEWAY_ENABLED === "true" || process.env.UPI_GATEWAY_ENABLED === "1";
  const isConfigured = Boolean(apiKey && apiSecret && url);

  return {
    enabled,
    url,
    apiKey,
    apiSecret,
    webhookSecret,
    environment,
    isConfigured,
  };
}

/**
 * Creates a dynamic payment order on the self-hosted UPI Gateway.
 * Returns the gateway order reference, hosted payment URL, and dynamic UPI Intent URI.
 */
export async function createUpiGatewayOrder(
  params: CreateGatewayOrderParams
): Promise<GatewayOrderResult> {
  const config = getUpiGatewayConfig();

  if (!config.isConfigured) {
    return {
      success: false,
      error: "UPI Gateway is not configured. Missing API credentials or Gateway URL.",
    };
  }

  const endpoint = `${config.url}/api/v1/orders`;
  const body = {
    amount: Number(params.amountRupees.toFixed(2)),
    client_order_id: params.clientOrderId,
    customer_name: params.customerName ? params.customerName.slice(0, 100) : undefined,
    customer_email: params.customerEmail ? params.customerEmail.slice(0, 255) : undefined,
    customer_mobile: params.customerMobile ? params.customerMobile.slice(0, 20) : undefined,
    note: params.note ? params.note.slice(0, 50) : `Aura Sparkles ${params.clientOrderId}`,
    redirect_url: params.redirectUrl || undefined,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": config.apiKey,
        "X-Api-Secret": config.apiSecret,
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      const errMsg = json?.message || json?.error || (json?.errors ? JSON.stringify(json.errors) : `Gateway returned HTTP ${res.status}`);
      return {
        success: false,
        error: `UPI Gateway order creation failed: ${errMsg}`,
        raw: json,
      };
    }

    const data = json.data || {};
    return {
      success: true,
      gatewayOrderId: data.order_id,
      clientOrderId: data.client_order_id,
      paymentUrl: data.payment_url,
      upiIntent: data.upi_intent,
      status: data.status,
      environment: data.environment,
      expiresAt: data.expires_at,
      raw: data,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const msg = err.name === "AbortError" ? "UPI Gateway timed out after 8s." : err.message;
    return {
      success: false,
      error: `Failed to connect to UPI Gateway at ${endpoint}: ${msg}`,
    };
  }
}

/**
 * Checks payment status of an order on the UPI Gateway.
 * Supports passing either Gateway order_id (ORD...) or Merchant client_order_id (AURA-...).
 */
export async function getUpiGatewayOrderStatus(
  orderIdOrClientOrderId: string
): Promise<GatewayStatusResult> {
  const config = getUpiGatewayConfig();

  if (!config.isConfigured) {
    return {
      success: false,
      error: "UPI Gateway is not configured.",
    };
  }

  const endpoint = `${config.url}/api/v1/orders/${encodeURIComponent(orderIdOrClientOrderId)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "X-Api-Key": config.apiKey,
        "X-Api-Secret": config.apiSecret,
        "Accept": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      return {
        success: false,
        error: json?.message || `Gateway status inquiry failed with HTTP ${res.status}`,
      };
    }

    const data = json.data || {};
    return {
      success: true,
      gatewayOrderId: data.order_id,
      clientOrderId: data.client_order_id,
      status: data.status,
      amount: data.amount,
      utr: data.utr || null,
      submittedUtr: data.submitted_utr || null,
      paidAt: data.paid_at || null,
      paymentUrl: data.payment_url,
      upiIntent: data.upi_intent || null,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      success: false,
      error: `Could not contact UPI Gateway: ${err.message}`,
    };
  }
}

/**
 * Verifies the HMAC-SHA256 signature in the X-Signature header sent by the UPI Gateway.
 */
export function verifyUpiGatewayWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined
): boolean {
  if (!signatureHeader || !rawBody) return false;

  const config = getUpiGatewayConfig();
  if (!config.webhookSecret) return false;

  try {
    const expected = crypto
      .createHmac("sha256", config.webhookSecret)
      .update(rawBody)
      .digest("hex");

    const expectedBuf = Buffer.from(expected, "hex");
    const receivedBuf = Buffer.from(signatureHeader.trim(), "hex");

    if (expectedBuf.length !== receivedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, receivedBuf);
  } catch (err) {
    console.error("[UPI Gateway] Error validating webhook signature:", err);
    return false;
  }
}

/**
 * Verifies gateway credentials and connectivity by querying the /api/v1/accounts endpoint.
 */
export async function testUpiGatewayConnection(): Promise<{
  connected: boolean;
  environment?: string;
  statusCode?: number;
  accountsCount?: number;
  message: string;
}> {
  const config = getUpiGatewayConfig();

  if (!config.url) {
    return { connected: false, message: "Gateway URL is missing." };
  }
  if (!config.apiKey || !config.apiSecret) {
    return { connected: false, message: "API Key or Secret is missing." };
  }

  const endpoint = `${config.url}/api/v1/accounts`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "X-Api-Key": config.apiKey,
        "X-Api-Secret": config.apiSecret,
        "Accept": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const json = await res.json().catch(() => null);

    if (res.status === 401 || res.status === 403) {
      return {
        connected: false,
        statusCode: res.status,
        message: "Authentication failed. Check your API Key and API Secret.",
      };
    }

    if (!res.ok) {
      return {
        connected: false,
        statusCode: res.status,
        message: json?.message || `Gateway returned HTTP status ${res.status}.`,
      };
    }

    const accounts = Array.isArray(json?.data) ? json.data : [];
    return {
      connected: true,
      statusCode: res.status,
      accountsCount: accounts.length,
      environment: config.environment,
      message: `Successfully connected to UPI Gateway (${config.environment.toUpperCase()} mode). ${accounts.length} payment accounts configured.`,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      connected: false,
      message: `Failed to reach UPI Gateway at ${config.url}: ${err.message}`,
    };
  }
}
