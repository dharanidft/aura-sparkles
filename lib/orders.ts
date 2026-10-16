import { Order, CartItem, ShippingAddress, PaymentStatus, OrderStatus } from "./types";
import { INITIAL_PRODUCTS } from "./products-data";

export function generateOrderId(): string {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `AS-${timestamp}-${random}`;
}

export function saveOrderToStorage(order: Order): void {
  if (typeof window === "undefined") return;
  try {
    const existing: Order[] = JSON.parse(localStorage.getItem("aura_orders") || "[]");
    const updated = [order, ...existing.filter((o) => o.id !== order.id)];
    localStorage.setItem("aura_orders", JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save order to localStorage", e);
  }
}

export function getOrderById(orderId: string): Order | null {
  if (typeof window === "undefined") return null;
  try {
    const existing: Order[] = JSON.parse(localStorage.getItem("aura_orders") || "[]");
    return existing.find((o) => o.id === orderId) || null;
  } catch (e) {
    console.error("Failed to fetch order", e);
    return null;
  }
}

export function getAllOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const existing: Order[] = JSON.parse(localStorage.getItem("aura_orders") || "[]");
    return existing;
  } catch (e) {
    return [];
  }
}

export function updateOrderStatusInStorage(orderId: string, status: OrderStatus): void {
  if (typeof window === "undefined") return;
  try {
    const existing: Order[] = JSON.parse(localStorage.getItem("aura_orders") || "[]");
    const updated = existing.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o));
    localStorage.setItem("aura_orders", JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to update order status", e);
  }
}

export function validateCartInventory(items: CartItem[]): { valid: boolean; error?: string } {
  for (const item of items) {
    const product = INITIAL_PRODUCTS.find((p) => p.id === item.product.id);
    if (!product) {
      return { valid: false, error: `Product "${item.product.name}" is no longer available.` };
    }
    if (!product.inStock || product.stockCount < item.quantity) {
      return {
        valid: false,
        error: `Only ${product.stockCount} units of "${product.name}" are currently in stock.`,
      };
    }
  }
  return { valid: true };
}
