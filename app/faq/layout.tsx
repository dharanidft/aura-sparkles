import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions & Candle Care — Aura Sparkles",
  description: "Find helpful answers about 100% natural soy wax, wick trimming, burn times, shipping timelines, and UPI payment verification.",
  openGraph: {
    title: "FAQ & Candle Care — Aura Sparkles",
    description: "Everything you need to know about burning, caring for, and enjoying your handcrafted soy candles.",
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
