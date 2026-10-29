import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order & Delivery Status — Aura Sparkles",
  description: "Enter your Aura Sparkles Order ID or phone number to check live verification, dispatch, and shipment tracking status.",
  openGraph: {
    title: "Track Order Status — Aura Sparkles",
    description: "Real-time dispatch and tracking updates for your handcrafted soy candle orders.",
  },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
