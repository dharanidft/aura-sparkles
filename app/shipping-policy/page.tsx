import React from "react";

export const metadata = {
  title: "Shipping Policy — AURA SPARKLES",
  description: "Shipping timelines, delivery rates, and courier coverage for AURA SPARKLES orders in India.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="py-16 md:py-24 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-white p-8 md:p-12 rounded-3xl border border-[#EAE0D5] shadow-subtle">
        
        <div className="space-y-2 border-b border-[#EAE0D5] pb-4">
          <p className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">Store Information</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#452638]">Shipping Policy</h1>
          <p className="text-xs text-[#766E65]">Last updated: October 2026</p>
        </div>

        <div className="space-y-6 text-xs text-[#766E65] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#452638]">1. Pan-India Delivery Coverage</h2>
            <p>
              AURA SPARKLES ships to all serviceable PIN codes across India through recognized express air and surface courier partners including BlueDart, Delhivery, and DTDC.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#452638]">2. Processing & Dispatch Timelines</h2>
            <p>
              All orders are packed and dispatched within 24 to 48 hours of confirmation (excluding Sundays and national holidays). Orders placed before 2:00 PM IST are prioritized for same-day handover to courier partners.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#452638]">3. Estimated Transit Times</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Tier 1 Metros:</strong> 2 to 3 business days (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai, Kolkata, Pune).</li>
              <li><strong>Tier 2 & Other Cities:</strong> 3 to 5 business days.</li>
              <li><strong>Remote / North-East Locations:</strong> 5 to 7 business days.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#452638]">4. Shipping Charges</h2>
            <p>
              We offer <strong>Free Express Shipping</strong> across India on all orders of ₹499 and above. For orders below ₹499, a nominal standard shipping fee of ₹49 is applied at checkout.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#452638]">5. Order Tracking</h2>
            <p>
              Once your shipment is handed over to the courier partner, tracking details and AWB numbers are generated and linked to your order confirmation summary.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
