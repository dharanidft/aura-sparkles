import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Refunds — Aura Sparkles",
  description: "Replacement guidelines and return terms for Aura Sparkles home fragrance products.",
};

export default function RefundPolicyPage() {
  return (
    <div className="py-16 md:py-24 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-white p-8 md:p-12 rounded-3xl border border-[#EAE0D5] shadow-subtle">
        
        <div className="space-y-2 border-b border-[#EAE0D5] pb-4">
          <p className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">Store Information</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#452638]">Returns &amp; Refund Policy</h1>
          <p className="text-xs text-[#766E65]">Last updated: October 2026</p>
        </div>

        <div className="space-y-6 text-xs text-[#766E65] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#452638]">1. Transit Damage &amp; Defective Deliveries</h2>
            <p>
              Due to the artisanal and personal nature of scented wax products, candles that have been lit or unsealed cannot be returned. However, we stand 100% behind the safe arrival of your order.
            </p>
            <p>
              If your glass jar or gift box arrives cracked, chipped, or damaged in transit, please notify us within <strong>48 hours</strong> of receipt with a photo of the package at{" "}
              <a href="mailto:care@aurasparkles.in" className="text-[#452638] font-semibold hover:underline">
                care@aurasparkles.in
              </a>
              , call{" "}
              <a href="tel:+919385328336" className="text-[#452638] font-semibold hover:underline">
                +91 93853 28336
              </a>
              , or message us on WhatsApp (
              <a
                href="https://wa.me/919385328336?text=Hi%20AURA%20SPARKLES,%20I%20have%20an%20issue%20with%20my%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#452638] font-semibold hover:underline"
              >
                +91 93853 28336
              </a>
              ).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#452638]">2. Immediate Free Replacement</h2>
            <p>
              Upon verification of transit damage, we will ship a brand-new replacement of your product without requiring you to return the broken glass.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#452638]">3. Cancellation &amp; Refunds</h2>
            <p>
              Orders may be cancelled free of charge before they are handed over to the courier partner. Once an order is in transit, cancellation cannot be processed.
            </p>
            <p>
              In cases where a refund is approved, it will be credited back to your original payment method (Bank/UPI/Card) within 5 to 7 working days.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
