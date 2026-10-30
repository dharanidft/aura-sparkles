import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & Studio Location (Chennai) — Aura Sparkles",
  description: "Get in touch with Aura Sparkles home fragrance studio in Chennai. Enquire about custom orders, corporate gifts, wedding favors, or track your delivery.",
  keywords: [
    "contact Aura Sparkles",
    "candle studio Chennai",
    "Ayanambakkam candle studio",
    "Aura Sparkles phone number",
    "custom candle order Chennai"
  ],
  alternates: {
    canonical: "https://www.aurasparkles.com/contact",
  },
  openGraph: {
    title: "Contact Aura Sparkles — Chennai Studio & Customer Support",
    description: "Get in touch for orders, custom fragrance requests, wedding favors, and corporate gifting. WhatsApp: +91 93853 28336.",
    url: "https://www.aurasparkles.com/contact",
    siteName: "Aura Sparkles",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
