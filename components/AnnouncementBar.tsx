"use client";

import React from "react";
import { Sparkles } from "lucide-react";

const ITEMS = [
  "Complimentary gift note & luxury packaging on all orders",
  "✦",
  "Free Express Shipping across India on orders above ₹499",
  "✦",
  "Pure hand-poured soy wax candles with authentic botanicals",
  "✦",
  "Discover your signature fragrance · Handcrafted with love in India",
  "✦",
  "Introductory price ₹199 — Limited period offer",
  "✦",
];

// Duplicate for seamless loop
const TICKER = [...ITEMS, ...ITEMS];

export function AnnouncementBar() {
  return (
    <div className="bg-[#452638] text-[#FAF7F2] py-2 overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#452638] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#452638] to-transparent z-10 pointer-events-none" />

      <div
        className="flex items-center whitespace-nowrap animate-ticker"
        style={{ width: "max-content" }}
      >
        {TICKER.map((item, i) =>
          item === "✦" ? (
            <Sparkles key={i} className="w-2.5 h-2.5 text-[#B69A62] mx-5 flex-shrink-0 opacity-70" />
          ) : (
            <span
              key={i}
              className="text-[11px] font-medium uppercase tracking-[0.14em] mx-4 text-[#FAF7F2]/90"
            >
              {item}
            </span>
          )
        )}
      </div>
    </div>
  );
}
