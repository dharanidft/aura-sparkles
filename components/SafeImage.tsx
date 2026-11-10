"use client";

import React, { useState } from "react";

export interface SafeImageProps {
  src?: string;
  alt: string;
  fallbackTitle?: string;
  className?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "auto" | "sync";
}

export function SafeImage({
  src,
  alt,
  fallbackTitle,
  className = "",
  loading = "lazy",
  decoding = "async",
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If no source or error occurred, show the luxury artisanal candle SVG
  if (!src || hasError) {
    const initials = (fallbackTitle || alt || "Aura")
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

    return (
      <div
        className={`relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF7F2] via-[#F4EBE1] to-[#EAE0D5] select-none overflow-hidden ${className}`}
        role="img"
        aria-label={alt || "Artisanal Scented Candle by Aura Sparkles"}
      >
        {/* Subtle decorative gold filigree ring */}
        <div className="absolute inset-1.5 border border-[#B69A62]/30 rounded-lg pointer-events-none" />

        {/* Ambient candle flame aura */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#A16207]/20 via-[#F59E0B]/30 to-amber-200/40 blur-md absolute top-1/3 animate-pulse" />

        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 relative z-10 text-[#A16207] transition-transform duration-300 group-hover:scale-105"
        >
          {/* Flame */}
          <path
            d="M24 6C24 6 20 12 20 16C20 18.2 21.8 20 24 20C26.2 20 28 18.2 28 16C28 12 24 6 24 6Z"
            fill="url(#candleFlameGrad)"
          />
          {/* Flame inner wick spark */}
          <circle cx="24" cy="16" r="1.5" fill="#FEF3C7" />
          {/* Wick */}
          <line x1="24" y1="20" x2="24" y2="23" stroke="#44403C" strokeWidth="1.5" strokeLinecap="round" />
          {/* Candle Jar Body */}
          <rect
            x="14"
            y="23"
            width="20"
            height="19"
            rx="3"
            fill="#FFFFFF"
            stroke="#B69A62"
            strokeWidth="1.2"
          />
          {/* Gold label strip */}
          <rect x="17" y="28" width="14" height="9" rx="1.5" fill="#FAF7F2" stroke="#D6D3D1" strokeWidth="0.8" />
          <line x1="19" y1="32.5" x2="29" y2="32.5" stroke="#A16207" strokeWidth="0.8" strokeLinecap="round" />
          <defs>
            <linearGradient id="candleFlameGrad" x1="24" y1="6" x2="24" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="1" stopColor="#A16207" />
            </linearGradient>
          </defs>
        </svg>

        <span className="relative z-10 mt-1 font-serif text-[10px] tracking-wider font-semibold text-[#44403C]/80 uppercase">
          {initials || "AURA"}
        </span>
      </div>
    );
  }

  const resolvedAlt = alt || fallbackTitle || "Handcrafted Scented Candle by Aura Sparkles";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={resolvedAlt}
      loading={loading}
      decoding={decoding}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
      className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-90"} ${className}`}
    />
  );
}
