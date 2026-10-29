import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Sign In — Aura Sparkles",
  description: "Sign in with your verified email address or WhatsApp OTP to view orders, track packages, and manage delivery addresses.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
