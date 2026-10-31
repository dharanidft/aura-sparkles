import fs from "fs";
import path from "path";
import crypto from "crypto";
import { StoredOrder } from "./upi-types";
import { formatINR } from "./shipping";

export type WhatsAppNotificationType =
  | "ORDER_PLACED"
  | "PAYMENT_PROOF_SUBMITTED"
  | "PAYMENT_VERIFIED"
  | "ORDER_PACKED"
  | "COURIER_DISPATCHED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FEEDBACK_REQUEST"
  | "REORDER_REMINDER";

export interface WhatsAppMessageRecord {
  id: string;
  orderId: string;
  notificationType: WhatsAppNotificationType;
  recipientPhone: string;
  recipientName: string;
  provider: "meta_whatsapp_cloud" | "openwa_gateway" | "simulated_dev";
  status: "SENT" | "DELIVERED" | "FAILED";
  messageText: string;
  timestamp: string;
  error?: string;
  metaMessageId?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const MESSAGES_FILE = path.join(DATA_DIR, "whatsapp-messages.json");
const MAX_LOG_ENTRIES = 500;

function ensureMessagesStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]), "utf8");
  }
}

export function getAllWhatsAppMessages(): WhatsAppMessageRecord[] {
  ensureMessagesStorage();
  try {
    const raw = fs.readFileSync(MESSAGES_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("[Aura WhatsApp] Error reading messages log:", err);
    return [];
  }
}

export function logWhatsAppMessage(entry: Omit<WhatsAppMessageRecord, "id" | "timestamp">): WhatsAppMessageRecord {
  ensureMessagesStorage();
  const id = `WA-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  const timestamp = new Date().toISOString();
  const record: WhatsAppMessageRecord = { id, timestamp, ...entry };

  try {
    const logs = getAllWhatsAppMessages();
    logs.unshift(record);
    if (logs.length > MAX_LOG_ENTRIES) {
      logs.splice(MAX_LOG_ENTRIES);
    }
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(logs, null, 2), "utf8");
  } catch (err) {
    console.error("[Aura WhatsApp] Error logging message:", err);
  }
  return record;
}

/**
 * Generate luxury branded copy for each customer notification milestone
 */
export function buildWhatsAppCopy(
  type: WhatsAppNotificationType,
  order: StoredOrder,
  extra?: { notes?: string; awb?: string; courier?: string; trackingUrl?: string }
): string {
  const customerName = order.customerDetails?.fullName?.split(" ")[0] || "Valued Customer";
  const totalRupees = formatINR(Math.round(order.totalPaise / 100));
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.aurasparkles.com").replace(/\/+$/, "");
  const trackingLink = `${appUrl}/pay/${order.orderId}?key=${order.accessKey}`;
  const upiId = process.env.UPI_ID || "dharanidft-1@okhdfcbank";

  switch (type) {
    case "ORDER_PLACED":
      return `✨ *Order Placed with Aura Sparkles* ✨\n\nDear ${customerName},\n\nThank you for choosing Aura Sparkles! We have received your order *${order.orderId}* for *${totalRupees}*.\n\n📱 *Complete Your UPI Payment:*\n1. UPI ID: \`${upiId}\`\n2. Amount: *${totalRupees}*\n3. Upload screenshot & UTR here:\n👉 ${trackingLink}\n\nOur Chennai studio will begin handcrafting your candles as soon as your payment is verified.`;

    case "PAYMENT_PROOF_SUBMITTED":
      const utr = order.proof?.transactionReference || "Submitted";
      return `⏳ *Payment Proof Received — Aura Sparkles*\n\nDear ${customerName},\n\nWe have received your payment proof (UTR: *${utr}*) for order *${order.orderId}*.\n\nOur accounts team is verifying this with our bank. We will send you an official confirmation as soon as it is verified!\n\nView order status:\n👉 ${trackingLink}`;

    case "PAYMENT_VERIFIED":
      return `🕯️ *Payment Verified & Order Confirmed!* ✨\n\nDear ${customerName},\n\nGreat news! Your payment of *${totalRupees}* for order *${order.orderId}* has been verified by our team.\n\nYour artisan soy candles are now officially in production at our Chennai studio. We will notify you the moment your package is packed with care!\n\nOrder details:\n👉 ${trackingLink}`;

    case "ORDER_PACKED":
      return `🎁 *Your Candles are Packed!* 📦\n\nDear ${customerName},\n\nYour order *${order.orderId}* has been freshly poured, cured, and carefully packed inside our signature gift box with care instructions.\n\nYour package is awaiting courier pickup today.\n\nOrder summary:\n👉 ${trackingLink}`;

    case "COURIER_DISPATCHED":
      const courier = extra?.courier || order.shipment?.courierName || "Express Courier";
      const awb = extra?.awb || order.shipment?.awbNumber || "Pending";
      const courierUrl = extra?.trackingUrl || order.shipment?.trackingUrl || trackingLink;
      return `🚀 *Your Aura Sparkles Package is on its Way!* 🚚\n\nDear ${customerName},\n\nYour order *${order.orderId}* has been handed over to our courier partner *${courier}*.\n\nTracking / AWB: *${awb}*\nTrack your package here:\n👉 ${courierUrl}\n\nExpected delivery: 2–4 business days.`;

    case "OUT_FOR_DELIVERY":
      return `📦 *Out for Delivery Today!* 🛵\n\nDear ${customerName},\n\nYour Aura Sparkles package (*${order.orderId}*) is out for delivery with the local courier.\n\nPlease ensure someone is available at your delivery address to receive the parcel.\n\nEnjoy the soothing fragrance experience!`;

    case "DELIVERED":
      return `🏡 *Delivered — Welcome to the Aura Family!* ✨\n\nDear ${customerName},\n\nYour Aura Sparkles package (*${order.orderId}*) has been delivered!\n\nWe hope our pure soy candles bring warmth, serenity, and aromatic luxury to your space. Remember to trim the wick to 6mm before lighting.\n\nThank you for supporting our craft!`;

    case "FEEDBACK_REQUEST":
      return `💬 *How is your Aura Sparkles experience?* 🌟\n\nDear ${customerName},\n\nIt has been a few days since your candles arrived. We would love to know how you are enjoying the fragrance throw and soothing glow!\n\nSimply reply to this message with your feedback. We read every single reply!`;

    case "REORDER_REMINDER":
      return `🕯️ *Time for a Refill?* 🌸\n\nDear ${customerName},\n\nWe hope your home has been filled with tranquil warmth. If your candles are burning low, treat yourself to fresh fragrances!\n\nUse VIP code *SPARKLE10* for 10% off your next order:\n👉 ${appUrl}`;

    default:
      return `✨ *Aura Sparkles Update*\n\nDear ${customerName}, your order *${order.orderId}* status has been updated to *${order.orderStatus}*.\n\nView details: ${trackingLink}`;
  }
}

/**
 * Dispatches an automated WhatsApp notification via Meta Cloud API or OpenWA.
 * Non-blocking: logs error if unavailable without crashing calling API.
 */
export async function dispatchOrderWhatsAppNotification(
  type: WhatsAppNotificationType,
  order: StoredOrder,
  extra?: { notes?: string; awb?: string; courier?: string; trackingUrl?: string }
): Promise<{ success: boolean; provider: string; messageId?: string; error?: string }> {
  const recipientPhone = order.customerDetails?.phone || "";
  const cleanPhone = recipientPhone.replace(/\D/g, "");

  if (!cleanPhone || cleanPhone.length < 10) {
    console.warn(`[Aura WhatsApp] Skipping notification (${type}): Invalid customer phone "${recipientPhone}" for order ${order.orderId}`);
    return { success: false, provider: "none", error: "Invalid phone number" };
  }

  // Format phone to standard E.164 without '+' for Meta (e.g., 919876543210)
  const metaRecipient = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const messageText = buildWhatsAppCopy(type, order, extra);
  const customerName = order.customerDetails?.fullName || "Customer";

  // 1. Primary: Meta WhatsApp Cloud API
  const metaToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_WHATSAPP_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID;

  if (metaToken && metaPhoneId) {
    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/${metaPhoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${metaToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: metaRecipient,
          type: "text",
          text: {
            preview_url: true,
            body: messageText,
          },
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.messages?.[0]?.id) {
        const messageId = resData.messages[0].id;
        logWhatsAppMessage({
          orderId: order.orderId,
          notificationType: type,
          recipientPhone: metaRecipient,
          recipientName: customerName,
          provider: "meta_whatsapp_cloud",
          status: "SENT",
          messageText,
          metaMessageId: messageId,
        });
        console.log(`[Aura WhatsApp] Meta Cloud API sent ${type} for order ${order.orderId} to ${metaRecipient}`);
        return { success: true, provider: "meta_whatsapp_cloud", messageId };
      } else {
        console.warn(`[Aura WhatsApp] Meta Cloud API failed for ${order.orderId}:`, resData.error || resData);
      }
    } catch (err: any) {
      console.error(`[Aura WhatsApp] Meta Cloud API network error:`, err.message);
    }
  }

  // 2. Secondary: OpenWA Gateway (if active)
  const openwaUrl = process.env.OPENWA_BASE_URL || process.env.OPENWA_URL;
  if (openwaUrl) {
    try {
      const cleanBase = openwaUrl.replace(/\/+$/, "");
      const res = await fetch(`${cleanBase}/sendText`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "bypass-tunnel-reminder": "true",
          "ngrok-skip-browser-warning": "69420",
          ...(process.env.OPENWA_API_KEY ? { Authorization: `Bearer ${process.env.OPENWA_API_KEY}` } : {}),
        },
        body: JSON.stringify({
          chatId: `${metaRecipient}@c.us`,
          content: messageText,
        }),
      });

      const resData = await res.json().catch(() => null);
      if (res.ok && (resData?.status === "success" || resData?.response)) {
        logWhatsAppMessage({
          orderId: order.orderId,
          notificationType: type,
          recipientPhone: metaRecipient,
          recipientName: customerName,
          provider: "openwa_gateway",
          status: "SENT",
          messageText,
        });
        console.log(`[Aura WhatsApp] OpenWA sent ${type} for order ${order.orderId} to ${metaRecipient}`);
        return { success: true, provider: "openwa_gateway" };
      }
    } catch (err: any) {
      console.error(`[Aura WhatsApp] OpenWA gateway error:`, err.message);
    }
  }

  // 3. Fallback: Development Mode simulation & logging
  logWhatsAppMessage({
    orderId: order.orderId,
    notificationType: type,
    recipientPhone: metaRecipient,
    recipientName: customerName,
    provider: "simulated_dev",
    status: "SENT",
    messageText,
  });

  console.log(`[Aura WhatsApp Simulation] ${type} for ${order.orderId} logged successfully to audit messages.`);
  return { success: true, provider: "simulated_dev" };
}
