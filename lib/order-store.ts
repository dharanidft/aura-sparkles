import fs from "fs";
import path from "path";
import crypto from "crypto";
import { StoredOrder, OrderPaymentStatus, PaymentProof } from "./upi-types";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const UPLOADS_DIR = path.join(DATA_DIR, "payment-proofs");

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([]), "utf8");
  }
}

export function getAllStoredOrders(): StoredOrder[] {
  ensureDirectories();
  try {
    const raw = fs.readFileSync(ORDERS_FILE, "utf8");
    return JSON.parse(raw) as StoredOrder[];
  } catch (err) {
    console.error("Error reading orders store:", err);
    return [];
  }
}

export function getStoredOrderById(orderId: string): StoredOrder | null {
  const orders = getAllStoredOrders();
  return orders.find((o) => o.orderId.toUpperCase() === orderId.toUpperCase()) || null;
}

export function saveStoredOrder(order: StoredOrder): void {
  ensureDirectories();
  const orders = getAllStoredOrders();
  const existingIdx = orders.findIndex((o) => o.orderId === order.orderId);
  if (existingIdx >= 0) {
    orders[existingIdx] = order;
  } else {
    orders.unshift(order);
  }
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
}

export function generateAuraOrderId(): string {
  ensureDirectories();
  const year = new Date().getFullYear();
  const orders = getAllStoredOrders();
  const nextSeq = (orders.length + 1).toString().padStart(6, "0");
  return `AURA-${year}-${nextSeq}`;
}

export function generateAccessKey(): string {
  return crypto.randomBytes(24).toString("hex");
}

export function getUploadsDirectory(): string {
  ensureDirectories();
  return UPLOADS_DIR;
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}
