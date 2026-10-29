import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & Concierge Support — Aura Sparkles",
  description: "Connect with Aura Sparkles studio in Chennai for candle enquiries, bespoke wedding favors, corporate gifting, or order support.",
  openGraph: {
    title: "Contact Us — Aura Sparkles Concierge",
    description: "Get in touch with the Aura Sparkles home fragrance team for artisan candle enquiries and support.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
