"use client";

import { Product, CartItem, Order } from "./types";

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

/**
 * Checks whether user has consented to analytics tracking.
 */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const consent = localStorage.getItem("aura_cookie_consent");
    // If not set, default to polite consent or check consent choice
    return consent === "all" || consent === "necessary_and_analytics" || consent === null;
  } catch {
    return true;
  }
}

/**
 * Safely push to Google dataLayer / gtag.
 */
function sendGtagEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  if (window.gtag) {
    window.gtag("event", eventName, params);
  } else if (window.dataLayer) {
    window.dataLayer.push({ event: eventName, ...params });
  }
}

/**
 * Safely push to Meta Pixel (fbq).
 */
function sendMetaEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  if (window.fbq) {
    window.fbq("track", eventName, params);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ECOMMERCE EVENTS
// ─────────────────────────────────────────────────────────────────────────────

export function trackViewItemList(products: Product[], listName = "Catalog") {
  sendGtagEvent("view_item_list", {
    item_list_name: listName,
    items: products.map((p, idx) => ({
      item_id: p.sku || p.id,
      item_name: p.name,
      item_category: p.category,
      price: p.price,
      index: idx + 1,
    })),
  });
}

export function trackSelectItem(product: Product, listName = "Catalog") {
  sendGtagEvent("select_item", {
    item_list_name: listName,
    items: [
      {
        item_id: product.sku || product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
      },
    ],
  });
}

export function trackViewItem(product: Product) {
  sendGtagEvent("view_item", {
    currency: "INR",
    value: product.price,
    items: [
      {
        item_id: product.sku || product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
      },
    ],
  });

  sendMetaEvent("ViewContent", {
    content_ids: [product.sku || product.id],
    content_name: product.name,
    content_category: product.category,
    value: product.price,
    currency: "INR",
  });
}

export function trackAddToCart(product: Product, quantity = 1, selectedVariant?: string) {
  sendGtagEvent("add_to_cart", {
    currency: "INR",
    value: product.price * quantity,
    items: [
      {
        item_id: product.sku || product.id,
        item_name: product.name,
        item_category: product.category,
        item_variant: selectedVariant || product.sizeVariant,
        price: product.price,
        quantity,
      },
    ],
  });

  sendMetaEvent("AddToCart", {
    content_ids: [product.sku || product.id],
    content_name: product.name,
    content_type: "product",
    value: product.price * quantity,
    currency: "INR",
  });
}

export function trackRemoveFromCart(product: Product, quantity = 1) {
  sendGtagEvent("remove_from_cart", {
    currency: "INR",
    value: product.price * quantity,
    items: [
      {
        item_id: product.sku || product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity,
      },
    ],
  });
}

export function trackBeginCheckout(items: CartItem[], total: number) {
  sendGtagEvent("begin_checkout", {
    currency: "INR",
    value: total,
    items: items.map((item) => ({
      item_id: item.product.sku || item.product.id,
      item_name: item.product.name,
      item_category: item.product.category,
      item_variant: item.selectedVariant || item.product.sizeVariant,
      price: item.product.price,
      quantity: item.quantity,
    })),
  });

  sendMetaEvent("InitiateCheckout", {
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value: total,
    currency: "INR",
  });
}

/**
 * Tracks a verified purchase.
 * Includes localStorage deduplication to ensure order refreshes don't double count.
 */
export function trackPurchase(order: Order) {
  if (typeof window === "undefined" || !order?.id) return;

  const dedupKey = `aura_purchase_tracked_${order.id}`;
  if (localStorage.getItem(dedupKey)) {
    return; // Already tracked
  }
  localStorage.setItem(dedupKey, Date.now().toString());

  sendGtagEvent("purchase", {
    transaction_id: order.id,
    value: order.total,
    currency: "INR",
    shipping: order.shippingFee,
    items: order.items.map((item) => ({
      item_id: item.product.sku || item.product.id,
      item_name: item.product.name,
      item_category: item.product.category,
      item_variant: item.selectedVariant || item.product.sizeVariant,
      price: item.product.price,
      quantity: item.quantity,
    })),
  });

  sendMetaEvent("Purchase", {
    value: order.total,
    currency: "INR",
    content_type: "product",
    order_id: order.id,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSION & INTENT EVENTS
// ─────────────────────────────────────────────────────────────────────────────

export function trackWhatsAppClick(source: string, extraDetails?: string) {
  sendGtagEvent("whatsapp_click", {
    event_category: "Engagement",
    event_label: source,
    details: extraDetails || "Direct WhatsApp Contact",
  });

  sendMetaEvent("Contact", {
    channel: "WhatsApp",
    source,
  });
}

export function trackContactSubmit(subject: string) {
  sendGtagEvent("generate_lead", {
    event_category: "Contact",
    event_label: subject,
  });

  sendMetaEvent("Lead", {
    content_name: subject,
  });
}

export function trackProductEnquiry(productName: string) {
  sendGtagEvent("product_enquiry", {
    event_category: "Engagement",
    event_label: productName,
  });
}

