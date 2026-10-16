"use client";

import React from "react";
import { Sparkles, Compass, PackageCheck, Flame } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { useRevealContainer } from "@/lib/useScrollReveal";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Fragrances for Every Mood",
    description:
      "From tranquil woody sandalwood to romantic Kannauj rose, each blend is orchestrated to complement your state of mind.",
    stat: 25,
    statSuffix: "+",
    statLabel: "Unique Fragrances",
  },
  {
    icon: Compass,
    title: "Thoughtfully Designed",
    description:
      "Frosted glass containers, lead-free cotton wicks, and pure soy wax formulated for a slow, soot-free, clean burn.",
    stat: 100,
    statSuffix: "%",
    statLabel: "Natural Soy Wax",
  },
  {
    icon: PackageCheck,
    title: "Beautifully Presented",
    description:
      "Every order arrives ready for gifting, nestled in our signature blush and ivory packaging with satin accents.",
    stat: 5000,
    statSuffix: "+",
    statLabel: "Happy Customers",
  },
  {
    icon: Flame,
    title: "Made for Everyday Moments",
    description:
      "Luxury that belongs in your everyday life—elevating quiet morning coffees, evening reading, and dinner with loved ones.",
    stat: 25,
    statSuffix: " Hrs",
    statLabel: "Burn Time",
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
            The AURA Difference
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-[#452638] font-normal tracking-tight">
            Why Choose AURA SPARKLES
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
                  {/* Pulse ring */}
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
