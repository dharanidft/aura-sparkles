import React from "react";

export const metadata = {
  title: "Terms & Conditions — AURA SPARKLES",
  description: "Terms and conditions for use and purchases on the AURA SPARKLES online store.",
};

export default function TermsPage() {
  return (
    <div className="py-16 md:py-24 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-white p-8 md:p-12 rounded-3xl border border-[#EAE0D5] shadow-subtle">
        
        <div className="space-y-2 border-b border-[#EAE0D5] pb-4">
          <p className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">Legal</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#452638]">Terms & Conditions</h1>
          <p className="text-xs text-[#766E65]">Last updated: October 2026</p>
        </div>

        <div className="space-y-6 text-xs text-[#766E65] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#452638]">1. General Overview</h2>
            <p>
              By accessing or purchasing from AURA SPARKLES (&ldquo;aurasparkles.in&rdquo;), you agree to comply with and be bound by these Terms and Conditions. These terms apply to all visitors, buyers, and merchants.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#452638]">2. Product Information & Pricing</h2>
            <p>
              We endeavor to portray candle fragrances, wax quantities, and jar finishes accurately. Prices are displayed in Indian Rupees (₹) and are subject to change without notice prior to checkout confirmation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#452638]">3. Candle Safety & Safe Burning Notice</h2>
            <p>
              Candles involve open flame. The buyer agrees to follow safety instructions printed on the base of every jar: never leave a burning candle unattended, burn out of reach of children and pets, keep away from drafts and flammable objects, and burn on heat-resistant surfaces.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#452638]">4. Governing Jurisdiction</h2>
            <p>
              Any disputes arising out of purchases or interactions with AURA SPARKLES shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
