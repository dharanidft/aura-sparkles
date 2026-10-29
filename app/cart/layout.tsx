import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Shopping Bag — Aura Sparkles",
  description: "Review your chosen handcrafted soy scented candles, wax sachets, and gift sets.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
