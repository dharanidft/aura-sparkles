"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { INITIAL_PRODUCTS, getStoreProducts, fetchStoreProducts } from "@/lib/products-data";
import { formatINR } from "@/lib/shipping";
import { Product } from "@/lib/types";

// Floating candle particles
function FloatingParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: 5 + Math.random() * 90,
    delay: Math.random() * 6,
    duration: 4 + Math.random() * 5,
    size: 3 + Math.random() * 5,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-0 rounded-full opacity-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0 ? "#B69A62" : p.id % 3 === 1 ? "#E8C9C5" : "#FAF7F2",
            animation: `particleRise ${p.duration}s ease-out ${p.delay}s infinite`,
            boxShadow: `0 0 ${p.size * 2}px ${p.id % 3 === 0 ? "#B69A62" : "#E8C9C5"}`,
          }}
        />
      ))}
    </div>
  );
}

// Magnetic button
function MagneticButton({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className: string;
  href: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.32;
    const dy = (e.clientY - cy) * 0.32;
    el.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate(0,0) scale(1)";
  };

  return (
    <Link
      ref={ref}
      href={href}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)" }}
    >
      {children}
    </Link>
  );
}

export function HeroSection() {
  const [visible, setVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  useEffect(() => {
    setProducts(getStoreProducts());
    fetchStoreProducts().then((fresh) => {
      if (fresh && fresh.length > 0) setProducts(fresh);
    });

    const handleUpdate = () => setProducts(getStoreProducts());
    window.addEventListener("aura_products_updated", handleUpdate);
    return () => window.removeEventListener("aura_products_updated", handleUpdate);
  }, []);

  // Authoritative catalogue data derivation
  const featuredProduct =
    products.find((p) => p.id === "jar-80-sandalwood") ||
    products.find((p) => p.slug === "mysore-sandalwood-candle-80g") ||
    products[0];

  const tealightProduct =
    products.find((p) => p.category === "Tea-Light Candles") || { price: 160 };

  const STATS = [
    { value: "100%", label: "Pure Soy Wax" },
    { value: `From ${formatINR(tealightProduct.price)}`, label: "Tea Lights (10-Pk)" },
    { value: `From ${formatINR(featuredProduct.price)}`, label: `Jar Candles (${featuredProduct.sizeVariant || "80g"})` },
  ];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const words = ["Make", "Every", "Moment"];
  const italic = ["Feel", "Special."];

  return (
    <section className="relative overflow-hidden bg-white py-12 md:py-20 lg:py-24 border-b border-[#EAE0D5]/60">
      {/* Animated ambient blobs */}
      <div
        className="absolute top-0 right-0 -mr-32 -mt-32 w-[28rem] h-[28rem] rounded-full bg-[#E8C9C5]/25 blur-3xl pointer-events-none animate-floatA"
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[28rem] h-[28rem] rounded-full bg-[#F2E9DF]/60 blur-3xl pointer-events-none animate-floatB"
        aria-hidden
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#B69A62]/8 blur-3xl pointer-events-none animate-floatA"
        style={{ animationDelay: "3s" }}
        aria-hidden
      />

      <FloatingParticles />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* ── Left Editorial Copy ── */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">

            {/* Badge */}
            <div
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#F2E9DF] border border-[#E8C9C5]/60 text-[#452638] text-[11px] font-semibold tracking-[0.15em] uppercase animate-border-pulse"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s ease 0.1s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s",
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B69A62] animate-spin-slow" />
              <span>TEA LIGHTS FROM ₹160 · JAR CANDLES FROM ₹249</span>
            </div>

            {/* H1 — word-by-word reveal */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#452638] font-normal leading-[1.12] tracking-tight">
              <span className="block">
                {words.map((w, i) => (
                  <span
                    key={w}
                    className="word-reveal inline-block mr-[0.22em]"
                    style={{ animationDelay: `${0.25 + i * 0.15}s` }}
                  >
                    {w}
                  </span>
                ))}
              </span>
              <span className="block italic font-light text-[#5D354D]">
                {italic.map((w, i) => (
                  <span
                    key={w}
                    className="word-reveal inline-block mr-[0.18em]"
                    style={{ animationDelay: `${0.7 + i * 0.15}s` }}
                  >
                    {w}
                  </span>
                ))}
              </span>
            </h1>

            {/* Body */}
            <p
              className="text-[#766E65] text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-sans leading-relaxed"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s ease 0.9s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.9s",
              }}
            >
              Thoughtfully chosen fragrances to bring warmth, calm, and everyday elegance into your sanctuary. Handcrafted with 100% natural soy wax, frosted glass, and pure Indian botanicals.
            </p>

            {/* CTAs */}
            <div
              className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s ease 1.05s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 1.05s",
              }}
            >
              <MagneticButton
                href="/shop"
                className="w-full sm:w-auto px-8 py-4 bg-[#452638] hover:bg-[#5D354D] text-[#FAF7F2] text-xs font-semibold tracking-[0.14em] uppercase rounded-full shadow-lg flex items-center justify-center space-x-2 group"
              >
                <span>SHOP COLLECTION</span>
                <ArrowRight className="w-4 h-4 text-[#B69A62] group-hover:translate-x-1.5 transition-transform duration-300" />
              </MagneticButton>

              <MagneticButton
                href="/story"
                className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-[#F2E9DF] text-[#452638] border border-[#452638]/30 hover:border-[#452638]/60 text-xs font-semibold tracking-[0.14em] uppercase rounded-full transition-all text-center"
              >
                DISCOVER OUR STORY
              </MagneticButton>
            </div>

            {/* Stats */}
            <div
              className="pt-8 border-t border-[#EAE0D5] grid grid-cols-3 gap-4 text-center lg:text-left"
              style={{
                opacity: visible ? 1 : 0,
                transition: "opacity 0.7s ease 1.2s",
              }}
            >
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className="group cursor-default"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(16px)",
                    transition: `opacity 0.6s ease ${1.2 + i * 0.12}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${1.2 + i * 0.12}s`,
                  }}
                >
                  <p className="font-serif text-2xl text-[#452638] font-semibold group-hover:text-[#B69A62] transition-colors duration-300">
                    {s.value}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-[#766E65]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Visual Composition ── */}
          <div
            className="lg:col-span-6 relative"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(40px)",
              transition: "opacity 0.9s ease 0.3s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.3s",
            }}
          >
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Main image - uncropped with object-contain */}
              <div className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden shadow-2xl border-2 border-[#EAE0D5] group flex items-center justify-center p-3">
                <Image
                  src={featuredProduct.images[0] || "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=85"}
                  alt={`${featuredProduct.name} - ${featuredProduct.netWeight}`}
                  fill
                  className={`object-contain p-2 transition-transform duration-[1.2s] ease-out group-hover:scale-105 ${imageLoaded ? "scale-100" : "scale-110"}`}
                  priority
                  onLoad={() => setImageLoaded(true)}
                />
                
                {/* Aura Sparkles Authenticity Mark */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-[#EAE0D5]">
                  <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                    <Image src="/images/logo.png" alt="Aura Sparkles" fill className="object-contain" />
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#452638]">
                    AURA SPARKLES
                  </span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#282522]/45 via-transparent to-transparent pointer-events-none" />

                {/* Floating caption dynamically tied to the authoritative featured product */}
                <Link
                  href={`/shop/${featuredProduct.slug}`}
                  className="absolute bottom-6 left-6 right-6 p-4 rounded-xl glass-nav border border-white/60 shadow-lg text-[#282522] translate-y-2 group-hover:translate-y-0 transition-all duration-500 block hover:border-[#B69A62]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] tracking-[0.15em] uppercase text-[#B69A62] font-bold">
                        Signature Edition · {featuredProduct.sizeVariant || "80g"} Jar
                      </p>
                      <p className="font-serif text-base font-semibold text-[#452638]">
                        {featuredProduct.name}
                      </p>
                      <p className="text-xs text-[#766E65]">
                        Frosted Glass Soy Candle · {featuredProduct.burnTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-[#452638]">
                        {formatINR(featuredProduct.price)}
                      </span>
                      <p className="text-[10px] text-emerald-700 font-medium">In Stock</p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Secondary floating image */}
              <div
                className="hidden sm:block absolute -top-6 -right-6 w-36 h-48 rounded-xl overflow-hidden border-4 border-white shadow-lg animate-floatB"
                style={{ animationDuration: "8s" }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=500&q=80"
                  alt="Damask Rose Botanical detail"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Official Brand Seal with AURA SPARKLES Logo */}
              <div className="absolute -bottom-5 -left-5 w-24 h-24 rounded-full bg-white p-1.5 shadow-2xl border-2 border-[#B69A62]/40 flex items-center justify-center text-center">
                <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                  <Image
                    src="/images/logo.png"
                    alt="AURA SPARKLES Official Seal"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
