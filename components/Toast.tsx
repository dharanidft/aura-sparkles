"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function Toast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounceIn">
      <div className="bg-[#452638] text-[#FAF7F2] px-5 py-3.5 rounded-xl shadow-elevated border border-[#B69A62]/40 flex items-center space-x-3 text-xs tracking-wide">
        <Sparkles className="w-4 h-4 text-[#B69A62] flex-shrink-0 animate-spin" />
        <span className="font-medium font-sans">{toastMessage}</span>
      </div>
    </div>
  );
}
