/**
 * Abstract Payment Verification Interface
 * Ready for future HDFC Bank SmartHub / UPI Merchant API integration.
 * 
 * NOTE: Per project requirements, manual admin verification is the primary verification mode.
 * Do not fake or simulate automatic bank approval without official bank merchant API credentials.
 */

export interface BankVerificationResult {
  isVerified: boolean;
  bankTransactionId?: string;
  utr?: string;
  amountPaise?: number;
  payerVpa?: string;
  rawResponse?: any;
  verificationSource: "MANUAL_ADMIN" | "HDFC_MERCHANT_API" | "UPI_GATEWAY";
  message: string;
}

export interface IPaymentVerificationService {
  verifyPayment(orderId: string, utr: string, expectedAmountPaise: number): Promise<BankVerificationResult>;
}

export class ManualPaymentVerificationService implements IPaymentVerificationService {
  async verifyPayment(orderId: string, utr: string, expectedAmountPaise: number): Promise<BankVerificationResult> {
    // Manual verification is governed by authenticated Administrator in the Admin Dashboard
    return {
      isVerified: false,
      utr,
      amountPaise: expectedAmountPaise,
      verificationSource: "MANUAL_ADMIN",
      message: "Order proof received. Awaiting manual reconciliation against HDFC Bank account statement.",
    };
  }
}

/**
 * Self-Hosted UPI Gateway Verification Service (upi-gateway-main).
 * Automatically checks transaction verification through the UPI Gateway API.
 */
export class UpiGatewayVerificationService implements IPaymentVerificationService {
  async verifyPayment(orderId: string, utr: string, expectedAmountPaise: number): Promise<BankVerificationResult> {
    try {
      const { getUpiGatewayOrderStatus, getUpiGatewayConfig } = await import("./upi-gateway");
      const config = getUpiGatewayConfig();
      if (!config.isConfigured) {
        return {
          isVerified: false,
          utr,
          amountPaise: expectedAmountPaise,
          verificationSource: "MANUAL_ADMIN",
          message: "UPI Gateway not configured. Awaiting manual admin reconciliation.",
        };
      }

      const res = await getUpiGatewayOrderStatus(orderId);
      if (res.success && res.status === "paid") {
        return {
          isVerified: true,
          bankTransactionId: res.gatewayOrderId,
          utr: res.utr || utr,
          amountPaise: expectedAmountPaise,
          verificationSource: "UPI_GATEWAY",
          rawResponse: res,
          message: "Payment successfully verified through self-hosted UPI Gateway.",
        };
      }

      return {
        isVerified: false,
        utr: res.utr || utr,
        amountPaise: expectedAmountPaise,
        verificationSource: "UPI_GATEWAY",
        rawResponse: res,
        message: res.status ? `Order status on UPI Gateway: ${res.status}` : "Payment not yet confirmed by gateway.",
      };
    } catch (err: any) {
      return {
        isVerified: false,
        utr,
        amountPaise: expectedAmountPaise,
        verificationSource: "MANUAL_ADMIN",
        message: `UPI Gateway check failed: ${err.message}`,
      };
    }
  }
}

/**
 * Future HDFC Bank Merchant API Service stub.
 * Activated once HDFC Bank merchant API credentials (MID, Merchant Key, Gateway URL)
 * are officially provided and approved by HDFC Bank.
 */
export class HdfcBankVerificationService implements IPaymentVerificationService {
  private mid: string | undefined;
  private apiKey: string | undefined;

  constructor() {
    this.mid = process.env.HDFC_MERCHANT_ID;
    this.apiKey = process.env.HDFC_API_KEY;
  }

  async verifyPayment(orderId: string, utr: string, expectedAmountPaise: number): Promise<BankVerificationResult> {
    if (!this.mid || !this.apiKey) {
      return {
        isVerified: false,
        verificationSource: "HDFC_MERCHANT_API",
        message: "HDFC Bank Merchant API credentials not configured in environment. Falling back to manual verification.",
      };
    }

    // Future implementation:
    // Call HDFC Bank transaction status enquiry endpoint using official TLS & signed payload.
    // Verify:
    // 1. Transaction status == SUCCESS
    // 2. Exact amount matches expectedAmountPaise
    // 3. Currency == INR
    // 4. merchant_ref_id == orderId
    // 5. Ensure duplicate check against previously settled UTRs
    throw new Error("HDFC Bank Merchant API endpoint not yet configured by bank. Manual reconciliation required.");
  }
}

export const upiGatewayVerifier = new UpiGatewayVerificationService();
export const paymentVerifier: IPaymentVerificationService = new UpiGatewayVerificationService();
