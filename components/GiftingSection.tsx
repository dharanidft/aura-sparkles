"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Gift, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRevealContainer } from "@/lib/useScrollReveal";

const FEATURES = [
  "Complimentary personalized greeting note",
  "Rigid blush & gold embossed packaging",
  "Pan-India express delivery to recipient",
  "Corporate & bespoke wedding orders",
];

export function GiftingSection() {
  const leftRef = useRevealContainer<HTMLDivElement>(0.15);
  const rightRef = useRevealContainer<HTMLDivElement>(0.15);

  return (
    <section className="py-20 bg-white border-b border-[#EAE0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#EAE0D5] p-8 md:p-14 shadow-xl overflow-hidden relative">

          {/* Ambient background blob */}
          <div
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#E8C9C5]/20 blur-3xl pointer-events-none animate-floatA"
            aria-hidden
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left Copy */}
            <div ref={leftRef} className="lg:col-span-7 space-y-6">
              <div className="reveal inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E8C9C5]/30 text-[#452638] text-[11px] font-semibold tracking-[0.14em] uppercase">
                <Gift className="w-3.5 h-3.5 text-[#B69A62]" />
                <span>THOUGHTFUL GIFTING</span>
              </div>

              <h2 className="reveal delay-100 font-serif text-3xl sm:text-4xl md:text-5xl text-[#452638] font-normal tracking-tight">
                "A Little Something{" "}
                <br />
                <span className="italic font-light text-[#5D354D]">That Means a Lot."</span>
              </h2>

              <p className="reveal delay-200 text-sm sm:text-base text-[#766E65] leading-relaxed max-w-xl">
                Whether celebrating a housewarming, festive gathering, or expressing heartfelt gratitude—a warm candle gift speaks directly to the senses. Every gift bundle is presented with satin ribbons, rigid keepsake boxes, and handwritten note options.
              </p>

              {/* Animated checklist */}
              <div className="reveal delay-300 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {FEATURES.map((feat, i) => (
                  <div
                    key={feat}
                    className="flex items-center space-x-2 text-xs text-[#452638] group"
                    style={{
                      animation: `wordReveal 0.6s cubic-bezier(0.16,1,0.3,1) ${0.4 + i * 0.1}s both`,
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#B69A62] flex-shrink-0 group-hover:scale-125 transition-transform duration-300" />
                    <span className="group-hover:text-[#B69A62] transition-colors duration-300">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="reveal delay-400 pt-4 flex flex-wrap gap-4">
                <Link
                  href="/shop?category=Gift+Sets"
                  className="px-8 py-3.5 bg-[#452638] hover:bg-[#5D354D] text-[#FAF7F2] text-xs font-semibold tracking-[0.14em] uppercase rounded-full shadow-md hover:shadow-lg transition-all flex items-center space-x-2 group hover:scale-105"
                  style={{ transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" }}
                >
                  <span>EXPLORE GIFTING</span>
                  <ArrowRight className="w-4 h-4 text-[#B69A62] group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3.5 bg-white hover:bg-[#F2E9DF] text-[#452638] border border-[#EAE0D5] hover:border-[#B69A62] text-xs font-semibold tracking-[0.14em] uppercase rounded-full transition-all hover:scale-105"
                  style={{ transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" }}
                >
                  BULK &amp; EVENT ENQUIRIES
                </Link>
              </div>
            </div>

            {/* Right Gift Imagery */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] bg-white rounded-2xl overflow-hidden shadow-2xl border-2 border-[#EAE0D5] group flex items-center justify-center p-3">
                <Image
                  src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"
                  alt="AURA SPARKLES Curated Gift Box with satin ribbon and frosted candle trio"
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-[1.2s] ease-out"
                />

                {/* Aura Sparkles Brand Mark */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-[#EAE0D5]">
                  <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                    <Image src="/images/logo.png" alt="Aura Sparkles" fill className="object-contain" />
                  </div>
                  <span className="text-[9px] font-bold tracking-[0.16em] uppercase text-[#452638]">
                    AURA SPARKLES
                  </span>
                </div>

                {/* Warm overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#452638]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Floating gift label */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 flex items-center space-x-2 shadow-md border border-[#E8C9C5] translate-y-0 group-hover:-translate-y-1 transition-transform duration-500">
                  <Gift className="w-3.5 h-3.5 text-[#B69A62]" />
                  <span className="text-[11px] font-semibold text-[#452638] tracking-wide">Gift Ready</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
