"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CURATED_COLLECTIONS } from "@/lib/products-data";
import { useRevealContainer } from "@/lib/useScrollReveal";

export function CollectionsSection() {
  const headerRef = useRevealContainer<HTMLDivElement>(0.2);
  const gridRef = useRevealContainer<HTMLDivElement>(0.08);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.15em] text-[#B69A62] font-semibold mb-2">
            Curated Categories
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-[#452638] font-normal tracking-tight">
            Shop by Collection
          </h2>
          <div className="w-12 h-[1px] bg-[#B69A62] mx-auto my-4" />
          <p className="text-sm text-[#766E65]">
            From morning rituals to celebratory gifting, discover intentional home fragrance arrangements.
          </p>
        </div>

        {/* Editorial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CURATED_COLLECTIONS.map((col, idx) => (
            <Link
              key={col.title}
              href={col.link}
              className="group relative h-96 rounded-2xl overflow-hidden shadow-lg border border-[#EAE0D5] flex flex-col justify-end p-8 transition-all duration-300 hover:shadow-2xl"
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <Image
                src={col.image}
                alt={col.title}
                fill
                className="object-cover group-hover:scale-108 transition-transform duration-[1.2s] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#282522]/90 via-[#282522]/40 to-transparent group-hover:from-[#452638]/95 transition-colors duration-500" />

              {/* Aura Sparkles Brand Seal Watermark */}
              <div className="absolute top-5 left-5 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#EAE0D5] shadow-sm pointer-events-none">
                <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                  <Image src="/images/logo.png" alt="Aura Sparkles Logo" fill className="object-contain" />
                </div>
                <span className="text-[9px] font-semibold tracking-wider uppercase text-[#452638]">
                  AURA SPARKLES
                </span>
              </div>

              <div className="relative z-10 space-y-2 text-white">
                <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#B69A62]">
                  Collection 0{idx + 1}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-medium leading-tight translate-y-1 group-hover:translate-y-0 transition-transform duration-400">
                  {col.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/90 max-w-md font-light leading-relaxed opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
                  {col.tagline}
                </p>
                <div className="pt-2 flex items-center space-x-2 text-xs uppercase tracking-[0.12em] font-semibold text-[#FAF7F2] group-hover:text-[#B69A62] transition-colors duration-300">
                  <span>DISCOVER COLLECTION</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
