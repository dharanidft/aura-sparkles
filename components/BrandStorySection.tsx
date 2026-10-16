"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRevealContainer } from "@/lib/useScrollReveal";

export function BrandStorySection() {
  const leftRef = useRevealContainer<HTMLDivElement>(0.15);
  const rightRef = useRevealContainer<HTMLDivElement>(0.15);
  const [lineWidth, setLineWidth] = useState(0);
  const lineRef = useRef<HTMLDivElement>(null);

  // Animate the divider line on scroll
  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLineWidth(64);
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="py-20 md:py-28 bg-white border-y border-[#EAE0D5]/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Imagery */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden shadow-2xl border-2 border-[#EAE0D5] group flex items-center justify-center p-3">
                <Image
                  src="https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?auto=format&fit=crop&w=1000&q=80"
                  alt="AURA SPARKLES candle lit in cozy warm living space"
                  fill
                  className="object-contain p-2 transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />

                {/* Aura Sparkles Brand Mark */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-[#EAE0D5]">
                  <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                    <Image src="/images/logo.png" alt="Aura Sparkles" fill className="object-contain" />
                  </div>
                  <span className="text-[9px] font-bold tracking-[0.16em] uppercase text-[#452638]">
                    AURA SPARKLES
                  </span>
                </div>

                {/* Overlay shimmer on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#B69A62]/0 via-[#B69A62]/10 to-[#B69A62]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </div>

              {/* Floating accent photo */}
              <div
                className="absolute -bottom-8 -right-6 w-48 h-56 bg-white rounded-xl overflow-hidden border-2 border-[#EAE0D5] shadow-xl hidden sm:flex items-center justify-center p-2"
                style={{ animationDelay: "0.3s" }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1596433809252-260c2745dfdd?auto=format&fit=crop&w=600&q=80"
                  alt="Botanical soy wax detail"
                  fill
                  className="object-contain p-1 hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Floating label badge */}
              <div className="reveal-scale delay-400 absolute top-6 -left-5 hidden sm:flex items-center space-x-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-[#E8C9C5] animate-floatA">
                <div className="w-2 h-2 rounded-full bg-[#B69A62] animate-glow" />
                <span className="text-[11px] font-semibold tracking-wider text-[#452638] uppercase">
                  Hand-Poured in India
                </span>
              </div>
            </div>
          </div>

          {/* Right Brand Story */}
          <div ref={rightRef} className="lg:col-span-6 space-y-6">
            <div className="reveal-right inline-flex items-center space-x-2 text-xs uppercase tracking-[0.15em] text-[#B69A62] font-semibold">
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
              <span>THE AURA SPARKLES PHILOSOPHY</span>
            </div>

            <h2 className="reveal-right delay-100 font-serif text-3xl sm:text-4xl md:text-5xl text-[#452638] font-normal tracking-tight leading-[1.15]">
              "More Than a Fragrance.{" "}
              <br />
              <span className="italic font-light text-[#5D354D]">A Feeling."</span>
            </h2>

            {/* Animated divider line */}
            <div
              ref={lineRef}
              className="h-[1px] bg-[#B69A62] transition-all duration-1000 ease-out"
              style={{ width: lineWidth }}
            />

            <div className="space-y-4 text-sm sm:text-base text-[#766E65] leading-relaxed">
              <p className="reveal-right delay-200">
                We believe that the scent of your home is the first thing that welcomes you and the last memory that lingers when guests leave. It has the quiet power to soften a long day, evoke cherished nostalgic afternoons, and transform an ordinary corner into a sacred sanctuary.
              </p>
              <p className="reveal-right delay-300">
                AURA SPARKLES was born from a desire for approachable luxury. Rather than overpowering synthetic sprays or inaccessible designer price tags, we hand-pour pure soy wax candles in frosted glass jars—designed to cast a gentle warm glow and infuse spaces with authentic, balanced aromas.
              </p>
              <p className="reveal-right delay-400 font-serif text-lg italic text-[#452638]">
                "From soothing Mysore Sandalwood to blooming Damask Rose, every jar is an invitation to pause, breathe, and illuminate your moments."
              </p>
            </div>

            <div className="reveal-right delay-500 pt-4">
              <Link
                href="/story"
                className="inline-flex items-center space-x-2 px-8 py-3.5 bg-[#452638] hover:bg-[#5D354D] text-[#FAF7F2] text-xs font-semibold tracking-[0.14em] uppercase rounded-full shadow-lg hover:shadow-xl transition-all group"
                style={{ transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" }}
              >
                <span>OUR STORY</span>
                <ArrowRight className="w-4 h-4 text-[#B69A62] group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
