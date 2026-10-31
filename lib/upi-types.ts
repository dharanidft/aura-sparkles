import { CartItem, ShippingAddress } from "./types";

export type OrderLifecycleStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_REVIEW"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DELIVERY_EXCEPTION"
  | "COMPLETED"
  | "CANCELLED";

export type OrderPaymentStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_REVIEW"
  | "CONFIRMED"
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

export interface ShipmentDetails {
  courierName: string; // e.g. "Shiprocket", "BlueDart", "Delhivery", "DTDC"
  awbNumber: string;
  trackingUrl: string;
  shippedAt?: string;
  pickupScheduledAt?: string;
  estimatedDeliveryDate?: string;
  deliveredAt?: string;
  currentCourierStatus?: string;
}

export interface OrderAuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  changedByRole: "ADMIN" | "CUSTOMER" | "SHIPROCKET_WEBHOOK" | "SYSTEM";
  author: string;
  previousStatus?: string;
  newStatus: string;
  reason?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface StoredOrder {
  orderId: string; // Format: AURA-2026-XXXXXX
  customerUid?: string;
  customerDetails: ShippingAddress;
  deliveryAddressSnapshot?: ShippingAddress;
  items: CartItem[];
  subtotalPaise: number;
  shippingPaise: number;
  discountPaise: number;
  totalPaise: number;
  currency: "INR";
  paymentMethod: "UPI" | "COD" | "CASH" | "CARD";
  paymentStatus: OrderPaymentStatus;
  orderStatus: OrderLifecycleStatus | "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  source?: "WEBSITE" | "INSTAGRAM" | "WHATSAPP" | "STUDIO_WALKIN";
  createdAt: string;
  updatedAt: string;
  accessKey: string; // Secret token given to anonymous customer to view their order & upload proof
  proof?: PaymentProof;
  shipment?: ShipmentDetails;
  auditTrail?: OrderAuditLogEntry[];
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

