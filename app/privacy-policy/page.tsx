import React from "react";

export const metadata = {
  title: "Privacy Policy — AURA SPARKLES",
  description: "Privacy and data protection terms for AURA SPARKLES online store.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16 md:py-24 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-white p-8 md:p-12 rounded-3xl border border-[#EAE0D5] shadow-subtle">
        
        <div className="space-y-2 border-b border-[#EAE0D5] pb-4">
          <p className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">Legal</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#452638]">Privacy Policy</h1>
          <p className="text-xs text-[#766E65]">Last updated: October 2026</p>
        </div>

        <div className="space-y-6 text-xs text-[#766E65] leading-relaxed">
          <p>
            At AURA SPARKLES, we respect your privacy and are committed to safeguarding your personal data. This Privacy Policy outlines what information we collect, how it is utilized, and your rights.
          </p>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#452638]">1. Information We Collect</h2>
            <p>
              When you purchase or browse our store, we collect details necessary to process your transaction and deliver products: your full name, email address, telephone contact number, delivery address, and PIN code.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#452638]">2. Payment Security</h2>
            <p>
              We do not store or process your credit/debit card numbers on our servers. All financial transactions are encrypted and processed through RBI-authorized payment aggregators (such as Razorpay).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#452638]">3. Data Sharing</h2>
            <p>
              We never sell or lease your personal information. Data is solely shared with essential fulfillment partners (logistics couriers and transactional notification services) to complete your order.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
