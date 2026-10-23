import { UpiConfig } from "./upi-types";

/**
 * Authoritative HDFC Bank UPI Configuration for Aura Sparkles.
 * Configurable via environment variables (with default placeholders).
 * 
 * Replace UPI_ID, UPI_MERCHANT_NAME, and UPI_QR_IMAGE_URL in .env
 * or GoDaddy App Settings Secrets with your live HDFC Bank merchant details.
 */
export function getUpiConfig(): UpiConfig {
  return {
    upiId: process.env.UPI_ID || "aurasparkles@hdfcbank",
    merchantName: process.env.UPI_MERCHANT_NAME || "AURA SPARKLES",
    qrImageUrl: process.env.UPI_QR_IMAGE_URL || "/images/upi-qr-placeholder.svg",
  };
}

/**
 * Builds a standardized, URL-encoded UPI Intent URI
 * compliant with NPCI UPI 2.0 specifications.
 * 
 * @param amountInRupees Total amount in INR (e.g. 549 or 549.00)
 * @param orderId Order ID to use as transaction reference (tr) and note (tn)
 */
export function generateUpiPaymentUri(amountInRupees: number, orderId: string): string {
  const config = getUpiConfig();
  const pa = encodeURIComponent(config.upiId);
  const pn = encodeURIComponent(config.merchantName);
  const am = encodeURIComponent(amountInRupees.toFixed(2));
  const cu = "INR";
  const tr = encodeURIComponent(orderId);
  const tn = encodeURIComponent(`Aura Sparkles Order ${orderId}`);

  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=${cu}&tr=${tr}&tn=${tn}`;
}
