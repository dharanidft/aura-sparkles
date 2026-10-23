import { CartItem, ShippingAddress } from "./types";

export type OrderPaymentStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_REVIEW"
  | "PAID"
  | "PAYMENT_REJECTED"
  | "PAYMENT_EXPIRED"
  | "REFUNDED";

export interface PaymentProof {
  orderId: string;
  transactionReference: string; // UTR or UPI Transaction Reference ID
  screenshotStoragePath: string; // File path on server storage
  screenshotFileName: string;
  screenshotMimeType: string;
  fileSizeBytes: number;
  submittedAt: string;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNote?: string;
}

export interface StoredOrder {
  orderId: string; // Format: AURA-2026-XXXXXX
  customerDetails: ShippingAddress;
  items: CartItem[];
  subtotalPaise: number;
  shippingPaise: number;
  discountPaise: number;
  totalPaise: number;
  currency: "INR";
  paymentMethod: "UPI";
  paymentStatus: OrderPaymentStatus;
  orderStatus: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
  updatedAt: string;
  accessKey: string; // Secret token given to anonymous customer to view their order & upload proof
  proof?: PaymentProof;
  adminAuditLog?: Array<{
    action: string;
    admin: string;
    timestamp: string;
    previousStatus: OrderPaymentStatus;
    newStatus: OrderPaymentStatus;
    reason?: string;
  }>;
}

export interface UpiConfig {
  upiId: string;
  merchantName: string;
  qrImageUrl: string;
}
