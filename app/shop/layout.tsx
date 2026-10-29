import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Handcrafted Scented Soy Candles & Home Fragrance — Aura Sparkles",
  description: "Browse our complete collection of hand-poured 100% soy wax candles, frosted glass jars, and botanical wax tablets. Pure, clean burning aromas crafted in India.",
  openGraph: {
    title: "Shop Handcrafted Scented Soy Candles — Aura Sparkles",
    description: "Handcrafted 100% natural soy wax candles and botanical aromas. Affordable everyday luxury starting from ₹160.",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
