import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Checkout — Aura Sparkles",
  description: "Complete your handcrafted soy candle purchase securely with direct UPI or online payments.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
