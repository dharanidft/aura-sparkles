import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Corporate Gifting & Bulk Wedding Favours — Luxury Handcrafted Candles | Aura Sparkles",
  description: "Elevate your corporate events, employee welcome hampers, and wedding return gifts with custom branded soy candles. Tiered bulk pricing, logo customization, and pan-India shipping.",
  keywords: [
    "corporate gifting candles bulk",
    "wedding return gifts under 500",
    "corporate gift hampers Chennai",
    "custom scented candles bulk order",
    "hotel fragrance supplier India",
    "handcrafted gifts Chennai"
  ],
  alternates: {
    canonical: "https://www.aurasparkles.com/corporate-gifting",
  },
  openGraph: {
    title: "Corporate Gifting & Bulk Wedding Favours — Aura Sparkles",
    description: "Premium handcrafted soy wax candles, luxury fragrance boxes, and custom branded event gifting solutions. Studio in Chennai, delivery across India.",
    url: "https://www.aurasparkles.com/corporate-gifting",
    siteName: "Aura Sparkles",
    type: "website",
  },
};

export default function CorporateGiftingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
