import { CartItem, ShippingAddress } from "./types";
import { OrderPaymentStatus, PaymentProof } from "./upi-types";

export interface Customer {
  uid: string; // Unique customer ID, e.g. "CUST-XXXXXX" or Firebase UID
  email?: string; // Primary account identifier (or optional if signed in via phone OTP)
  emailVerified?: boolean;
  displayName?: string;
  phoneNumber?: string; // Optional delivery contact mobile number
  defaultAddressId?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  accountStatus: "ACTIVE" | "SUSPENDED";
}

export type AddressType = "Home" | "Work" | "Other";

export interface CustomerAddress {
  addressId: string;
  customerUid: string;
  recipientName: string;
  deliveryPhone: string;
  houseFlat: string;
  buildingApartment?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string; // 6-digit Indian PIN code
  addressType: AddressType;
  deliveryInstructions?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrderSnapshot {
  orderId: string;
  customerUid?: string;
  customerPhone: string;
  customerName: string;
  items: CartItem[];
  subtotalPaise: number;
  shippingPaise: number;
  discountPaise: number;
  totalPaise: number;
  currency: "INR";
  paymentMethod: "UPI" | "COD";
  paymentStatus: OrderPaymentStatus;
  orderStatus: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  deliveryAddressSnapshot: CustomerAddress | ShippingAddress;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  proof?: PaymentProof;
}

export interface SessionTokenPayload {
  uid: string;
  email: string;
  phoneNumber?: string;
  issuedAt: number;
  expiresAt: number;
}
