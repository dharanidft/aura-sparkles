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
  verificationSource: "MANUAL_ADMIN" | "HDFC_MERCHANT_API";
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

export const paymentVerifier: IPaymentVerificationService = new ManualPaymentVerificationService();
