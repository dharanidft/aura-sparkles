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
 * Reads from data/products.json if available; merges with INITIAL_PRODUCTS to guarantee
 * all official items and SEO attributes are preserved.
 */
export function getAuthoritativeProducts(): Product[] {
  ensureProductStoreDirectories();
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge missing initial products if any were newly defined
        const existingSlugs = new Set(parsed.map((p: Product) => p.slug));
        const missingInitial = INITIAL_PRODUCTS.filter((ip) => !existingSlugs.has(ip.slug));
        if (missingInitial.length > 0) {
          const merged = [...parsed, ...missingInitial];
          fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(merged, null, 2), "utf8");
          return merged;
        }
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
 * Finds a single product by its slug from authoritative store.
 */
export function getAuthoritativeProductBySlug(slug: string): Product | undefined {
  const products = getAuthoritativeProducts();
  return products.find((p) => p.slug === slug);
}

/**
 * Updates a specific product in authoritative store.
 */
export function updateAuthoritativeProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getAuthoritativeProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  products[idx] = { ...products[idx], ...updates };
  saveAuthoritativeProducts(products);
  return products[idx];
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
