"use client";

import React from "react";
import Image from "next/image";
import { Instagram, ArrowUpRight } from "lucide-react";
import { useRevealContainer } from "@/lib/useScrollReveal";

const OFFICIAL_INSTAGRAM_URL = "https://www.instagram.com/aurasparklesofficial/";

const INSTAGRAM_SHOTS = [
  {
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
    caption: "Golden hour tranquility with Mysore Sandalwood.",
    handle: "@aurasparklesofficial",
  },
  {
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80",
    caption: "Damask Rose petals infused in clean soy wax.",
    handle: "@aurasparklesofficial",
  },
  {
    image: "https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?auto=format&fit=crop&w=600&q=80",
    caption: "Intimate dinner settings illuminated by candlelight.",
    handle: "@aurasparklesofficial",
  },
  {
    image: "https://images.unsplash.com/photo-1596433809252-260c2745dfdd?auto=format&fit=crop&w=600&q=80",
    caption: "Warm Madagascar vanilla custard aromas.",
    handle: "@aurasparklesofficial",
  },
  {
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
    caption: "Blush keepsake boxes ready for festive gifting.",
    handle: "@aurasparklesofficial",
  },
];

export function InstagramGallery() {
  const headerRef = useRevealContainer<HTMLDivElement>(0.2);
  const gridRef = useRevealContainer<HTMLDivElement>(0.08);

  return (
    <section className="py-20 bg-white border-b border-[#EAE0D5]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-12">
          <a
            href={OFFICIAL_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.15em] text-[#B69A62] font-semibold mb-2 hover:underline"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>@AURASPARKLESOFFICIAL</span>
          </a>
          <h2 className="font-serif text-3xl md:text-4xl text-[#452638] font-normal tracking-tight">
            Moments in Light &amp; Scent
          </h2>
          <div className="w-12 h-[1px] bg-[#B69A62] mx-auto my-3" />
          <p className="text-sm text-[#766E65]">
            Curated brand moments. Tag <span className="text-[#452638] font-medium">#AuraSparklesHome</span> and visit our official Instagram community.
          </p>
        </div>

        {/* Gallery grid - Static gallery preview linking directly to official profile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {INSTAGRAM_SHOTS.map((item, idx) => (
            <a
              key={idx}
              href={OFFICIAL_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${item.caption} on Aura Sparkles official Instagram`}
              className="group relative aspect-square rounded-xl overflow-hidden border border-[#EAE0D5] shadow-sm block transition-all duration-300 hover:shadow-lg"
              style={{
                transitionDelay: `${idx * 90}ms`,
              }}
            >
              <Image
                src={item.image}
                alt={item.caption}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />

              {/* Aura Sparkles Brand Mark */}
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-white/60 shadow-xs pointer-events-none">
                <div className="relative w-3.5 h-3.5 rounded-full overflow-hidden flex-shrink-0">
                  <Image src="/images/logo.png" alt="Aura Sparkles" fill className="object-contain" />
                </div>
                <span className="text-[7.5px] font-semibold tracking-wider uppercase text-[#452638]">
                  AURA
                </span>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-[#452638]/75 opacity-0 group-hover:opacity-100 transition-all duration-400 flex flex-col justify-between p-4 text-white">
                <div className="flex justify-end translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                  <div className="w-7 h-7 rounded-full bg-[#B69A62] flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <div className="space-y-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-400 delay-75">
                  <Instagram className="w-4 h-4 text-white" />
                  <p className="text-[11px] leading-tight line-clamp-2 text-white/90">
                    {item.caption}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href={OFFICIAL_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-8 py-3 bg-white hover:bg-[#F2E9DF] text-[#452638] border border-[#EAE0D5] hover:border-[#B69A62] text-xs font-semibold tracking-[0.14em] uppercase rounded-full shadow-sm transition-all hover:scale-105"
            style={{ transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" }}
          >
            <span>FOLLOW OUR JOURNEY</span>
            <ArrowUpRight className="w-4 h-4 text-[#B69A62]" />
          </a>
        </div>

      </div>
    </section>
  );
}
