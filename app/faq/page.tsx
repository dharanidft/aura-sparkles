"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Sparkles, Flame, Truck, HelpCircle, Phone, Mail } from "lucide-react";

interface FAQItem {
  q: string;
  a: string | React.ReactNode;
  category: "Candle Care & Safety" | "Orders & Shipping" | "Ingredients & Fragrances";
}

const FAQS: FAQItem[] = [
  {
    category: "Orders & Shipping",
    q: "What is your free shipping policy across India?",
    a: "Free shipping on orders ₹499 and above. For orders below ₹499, a nominal shipping charge of ₹49 is applied. This threshold is calculated on your eligible merchandise subtotal after any promotional discounts."
  },
  {
    category: "Orders & Shipping",
    q: "What is your standard delivery timeline across India?",
    a: "Orders placed before 2:00 PM IST dispatch the same day. Delivery takes 2 to 3 business days for tier-1 metro cities (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai, Kolkata, Pune) and 3 to 5 business days for other pin codes."
  },
  {
    category: "Orders & Shipping",
    q: "What happens if a glass candle jar arrives damaged in transit?",
    a: "We take extreme care with multi-layered protective cushioning. However, if transit damage occurs, notify us within 48 hours of receipt at contact@aurasparkles.com or via WhatsApp (+91 93853 28336) with a photo of the package, and we will dispatch a brand-new free replacement immediately."
  },
  {
    category: "Orders & Shipping",
    q: "Do you offer Cash on Delivery (COD)?",
    a: "Yes! Cash on Delivery (COD) is available at checkout for serviceable Indian PIN codes."
  },
  {
    category: "Candle Care & Safety",
    q: "Why is the first burn so important?",
    a: "Soy wax has memory! On your first burn, allow the candle to burn for 2 to 3 consecutive hours until the melted wax pool reaches all edges of the glass jar. This prevents 'tunneling' (wax clinging to the sides) and ensures an even burn for the lifetime of the candle."
  },
  {
    category: "Candle Care & Safety",
    q: "How should I trim the wick?",
    a: "Always trim the cotton wick to 1/4 inch (6mm) before lighting every time. Trimming keeps the flame at the ideal height, prevents mushrooming of the wick, and completely eliminates black soot."
  },
  {
    category: "Candle Care & Safety",
    q: "How long should I burn the candle in one session?",
    a: "We recommend burning your Aura Sparkles candle for 2 to 4 hours at a time. Never burn for more than 4 consecutive hours, as the jar may get excessively hot."
  },
  {
    category: "Ingredients & Fragrances",
    q: "What wax do you use?",
    a: "We hand-pour 100% pure natural soy wax. Unlike conventional paraffin candles that release petroleum fumes, soy wax is plant-derived, biodegradable, burns up to 50% longer, and produces a clean, soot-free aroma."
  },
  {
    category: "Ingredients & Fragrances",
    q: "Are the fragrance oils safe?",
    a: "Yes. Our fragrances are crafted with authentic botanical essences and IFRA-compliant fragrance compounds without phthalates or harmful parabens."
  }
];

export default function FAQPage() {
  const [openIndices, setOpenIndices] = useState<number[]>([0, 1]);

  useEffect(() => {
    document.title = "Frequently Asked Questions — Aura Sparkles";
  }, []);

  const toggle = (idx: number) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="py-16 md:py-24 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">
            Help &amp; Guidance
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#452638] font-normal tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-[#766E65]">
            Everything you need to know about our soy wax, burn rituals, free shipping rules, and delivery.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndices.includes(idx);
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#EAE0D5] overflow-hidden shadow-subtle transition-all"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 text-left flex items-center justify-between space-x-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#B69A62]">
                      {faq.category}
                    </span>
                    <h2 className="font-serif text-lg font-medium text-[#452638]">
                      {faq.q}
                    </h2>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-[#B69A62] flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#766E65] leading-relaxed border-t border-[#EAE0D5]/50 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions */}
        <div className="p-8 bg-[#FAF7F2] rounded-3xl border border-[#EAE0D5] text-center space-y-3">
          <h3 className="font-serif text-xl text-[#452638]">Still Have Questions?</h3>
          <p className="text-xs text-[#766E65] max-w-md mx-auto">
            Our customer care specialists are ready to help with recommendations, ongoing orders, and custom gifting.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <a
              href="https://wa.me/919385328336?text=Hi%20Aura%20Sparkles,%20I%20have%20a%20question"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full transition-colors flex items-center space-x-2"
            >
              <span>WhatsApp Us (+91 93853 28336)</span>
            </a>
            <a
              href="tel:+919385328336"
              className="px-6 py-2.5 bg-white border border-[#452638] text-[#452638] hover:bg-[#452638] hover:text-white rounded-full transition-colors"
            >
              Call Helpline
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
