import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, Heart, Feather, Flame } from "lucide-react";

export const metadata = {
  title: "Our Story — AURA SPARKLES | Illuminate Your Moments",
  description: "Learn about the craft, philosophy, and artisan roots of AURA SPARKLES home fragrances.",
};

export default function StoryPage() {
  return (
    <div className="py-16 md:py-24 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The AURA Genesis</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#452638] font-normal tracking-tight">
            Illuminate Your Moments
          </h1>
          <p className="text-base text-[#766E65] font-light italic">
            “Fragrance that turns everyday houses into welcoming, tranquil homes.”
          </p>
        </div>

        {/* Feature Visual */}
        <div className="relative aspect-[16/9] bg-white rounded-3xl overflow-hidden border-2 border-[#EAE0D5] shadow-elevated flex items-center justify-center p-2">
          <Image
            src="https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?auto=format&fit=crop&w=1200&q=85"
            alt="Candle making and ambiance craft"
            fill
            className="object-contain p-2"
            priority
          />
          {/* Aura Sparkles Authenticity Mark */}
          <div className="absolute top-6 left-6 z-10 flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-[#EAE0D5]">
            <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              <Image src="/images/logo.png" alt="Aura Sparkles" fill className="object-contain" />
            </div>
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#452638]">
              AURA SPARKLES
            </span>
          </div>
        </div>

        {/* Narrative Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm text-[#766E65] leading-relaxed">
          <div className="space-y-4">
            <h2 className="font-serif text-2xl text-[#452638] font-medium">
              The Essence of Approachable Luxury
            </h2>
            <p>
              In our fast-paced lives, home is our anchor. Yet so often, scented candles in India were either mass-produced synthetic waxes that irritate the senses or ultra-expensive imported labels priced out of daily enjoyment.
            </p>
            <p>
              AURA SPARKLES was born to bridge this exact gap. We set out to craft affordable luxury—formulating natural soy wax candles in timeless frosted-glass jars that you never feel hesitant to light, whether you are enjoying your morning meditation, reading in bed, or gathering around dinner with loved ones.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-2xl text-[#452638] font-medium">
              Authentic Indian Botanicals
            </h2>
            <p>
              Our fragrance palette honors the sensory richness of the subcontinent. From the sacred woody depth of Mysore Sandalwood to the sweet, intoxicating nostalgia of night-blooming Kannauj Mogra and dewy Damask Roses, every fragrance is orchestrated with nuanced top, heart, and base notes.
            </p>
            <p>
              Every jar is hand-poured with 100% natural soy wax and fitted with a clean lead-free cotton wick to guarantee a slow, soothing, soot-free burn of over 22 hours.
            </p>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 bg-white rounded-2xl border border-[#EAE0D5] text-center space-y-3">
            <Flame className="w-6 h-6 text-[#B69A62] mx-auto" />
            <h3 className="font-serif text-lg font-medium text-[#452638]">100% Pure Soy Wax</h3>
            <p className="text-xs text-[#766E65]">Clean-burning, non-toxic, and longer lasting than conventional paraffin.</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#EAE0D5] text-center space-y-3">
            <Feather className="w-6 h-6 text-[#B69A62] mx-auto" />
            <h3 className="font-serif text-lg font-medium text-[#452638]">Thoughtful Aesthetics</h3>
            <p className="text-xs text-[#766E65]">Frosted glass, muted gold details, and blush packaging designed to elevate your decor.</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#EAE0D5] text-center space-y-3">
            <Heart className="w-6 h-6 text-[#B69A62] mx-auto" />
            <h3 className="font-serif text-lg font-medium text-[#452638]">Thoughtful Gifting</h3>
            <p className="text-xs text-[#766E65]">Curated keepsake gift boxes that make every recipient feel genuinely cherished.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8 border-t border-[#EAE0D5]">
          <Link
            href="/shop"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-[#452638] hover:bg-[#5D354D] text-white text-xs font-semibold tracking-luxury uppercase rounded-full shadow-md transition-all"
          >
            <span>DISCOVER OUR CANDLES</span>
            <ArrowRight className="w-4 h-4 text-[#B69A62]" />
          </Link>
        </div>

      </div>
    </div>
  );
}
