import fs from "fs";
import path from "path";
import { Product } from "./types";
import { INITIAL_PRODUCTS } from "./products-data";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "products");

export function ensureProductStoreDirectories(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

/**
 * Returns authoritative list of products.
 * Reads from data/products.json if available; falls back to INITIAL_PRODUCTS.
 */
export function getAuthoritativeProducts(): Product[] {
  ensureProductStoreDirectories();
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Product[];
      }
    }
  } catch (err) {
    console.error("Error reading authoritative products store:", err);
  }
  return INITIAL_PRODUCTS;
}

/**
 * Saves authoritative list of products to data/products.json.
 */
export function saveAuthoritativeProducts(products: Product[]): void {
  ensureProductStoreDirectories();
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing authoritative products store:", err);
    throw err;
  }
}

/**
 * Resets products to official defaults.
 */
export function resetAuthoritativeProducts(): Product[] {
  ensureProductStoreDirectories();
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), "utf8");
  } catch (err) {
    console.error("Error resetting authoritative products store:", err);
  }
  return INITIAL_PRODUCTS;
}
