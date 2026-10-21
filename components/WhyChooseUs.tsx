"use client";

import React from "react";
import { Sparkles, Compass, PackageCheck, Flame } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { useRevealContainer } from "@/lib/useScrollReveal";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Artisanal Fragrance Blends",
    description:
      "From tranquil woody Mysore sandalwood to Kannauj damask rose, each blend is thoughtfully orchestrated with pure botanicals.",
    stat: 12,
    statSuffix: "+",
    statLabel: "Curated Fragrances",
  },
  {
    icon: Compass,
    title: "Thoughtfully Hand-Poured",
    description:
      "Frosted glass containers, lead-free cotton wicks, and pure plant-based soy wax formulated for a clean, soot-free burn.",
    stat: 100,
    statSuffix: "%",
    statLabel: "Natural Soy Wax",
  },
  {
    icon: PackageCheck,
    title: "Keepsake Gift Presentation",
    description:
      "Every order arrives securely packaged and gifting-ready, nestled with protective cushioning and complimentary gift card.",
    stat: 499,
    statSuffix: " ₹+",
    statLabel: "Free Shipping Order",
  },
  {
    icon: Flame,
    title: "Authoritative Burn Times",
    description:
      "Measured for consistent, safe performance: 18–22 hours for our 80g signature jars, and 3–4 hours per tea-light candle.",
    stat: 22,
    statSuffix: " Hrs",
    statLabel: "80g Jar Burn Time",
  },
];

export function WhyChooseUs() {
  const headerRef = useRevealContainer<HTMLDivElement>(0.2);
  const gridRef = useRevealContainer<HTMLDivElement>(0.08);

  return (
    <section className="py-20 bg-white border-b border-[#EAE0D5]/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.15em] text-[#B69A62] font-semibold mb-2">
            The Aura Difference
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-[#452638] font-normal tracking-tight">
            Why Choose Aura Sparkles
          </h2>
          <div className="w-12 h-[1px] bg-[#B69A62] mx-auto my-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white p-8 rounded-2xl border border-[#EAE0D5] hover:border-[#B69A62]/40 shadow-sm hover:shadow-xl transition-all duration-500 text-center flex flex-col items-center space-y-4 group cursor-default"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                {/* Icon */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-white border border-[#E8C9C5] flex items-center justify-center text-[#452638] group-hover:bg-[#452638] group-hover:border-[#452638] transition-all duration-500 shadow-sm">
                    <Icon className="w-7 h-7 transition-all duration-500 group-hover:text-[#B69A62] group-hover:scale-110" />
                  </div>
                  <div className="absolute inset-0 rounded-full border border-[#B69A62]/30 scale-100 group-hover:scale-125 group-hover:opacity-0 transition-all duration-700" />
                </div>

                {/* Animated stat */}
                <div className="text-center">
                  <p className="font-serif text-3xl font-semibold text-[#B69A62]">
                    <AnimatedCounter
                      target={item.stat}
                      suffix={item.statSuffix}
                      duration={1600}
                    />
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-[#766E65] font-medium">
                    {item.statLabel}
                  </p>
                </div>

                <h3 className="font-serif text-xl font-medium text-[#452638] group-hover:text-[#5D354D] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[#766E65] leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
