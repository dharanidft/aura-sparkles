"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { FRAGRANCE_CATEGORIES } from "@/lib/products-data";
import { useRevealContainer } from "@/lib/useScrollReveal";

export function FragranceCategories() {
  const sectionRef = useRevealContainer<HTMLDivElement>(0.1);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <p className="text-xs uppercase tracking-[0.15em] text-[#B69A62] font-semibold mb-2">
            Curated Scent Moods
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-[#452638] font-normal tracking-tight">
            Shop by Fragrance
          </h2>
          <div className="w-12 h-[1px] bg-[#B69A62] mx-auto my-4" />
          <p className="text-sm text-[#766E65] leading-relaxed">
            Select a scent profile that resonates with your mood, space, or evening ritual.
          </p>
        </div>

        {/* Photographic Tiles Grid */}
        <div ref={sectionRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {FRAGRANCE_CATEGORIES.map((cat, idx) => (
            <TiltCard key={cat.name} cat={cat} delay={idx * 80} />
          ))}
        </div>

      </div>
    </section>
  );
}

interface Cat {
  name: string;
  image: string;
  description: string;
}

function TiltCard({ cat, delay }: { cat: Cat; delay: number }) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    el.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.03,1.03,1.03)`;
  };
  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (el) el.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
  };

  return (
    <Link
      ref={cardRef}
      href={`/shop?fragrance=${encodeURIComponent(cat.name)}`}
      className="group relative aspect-[3/4] rounded-xl overflow-hidden shadow-md hover:shadow-xl border border-[#EAE0D5] flex flex-col justify-end p-4 card-tilt transition-all duration-300"
      style={{
        transitionDelay: `${delay}ms`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src={cat.image}
        alt={cat.name}
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#282522]/85 via-[#282522]/30 to-transparent group-hover:from-[#452638]/90 transition-colors duration-500" />

      {/* Aura Sparkles Brand Seal Watermark */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-white/60 shadow-xs pointer-events-none">
        <div className="relative w-3.5 h-3.5 rounded-full overflow-hidden flex-shrink-0">
          <Image src="/images/logo.png" alt="Aura Sparkles" fill className="object-contain" />
        </div>
        <span className="text-[8px] font-semibold tracking-wider uppercase text-[#452638]">
          AURA
        </span>
      </div>

      <div className="relative z-10 space-y-1 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-medium leading-snug">{cat.name}</h3>
          <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-300">
            <ArrowUpRight className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        <p className="text-[11px] text-white/85 line-clamp-2 font-sans font-light opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          {cat.description}
        </p>
      </div>
    </Link>
  );
}
