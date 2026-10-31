"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function Toast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div 
      className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 animate-toast-up flex justify-center sm:justify-end pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div className="bg-[#452638] text-[#FAF7F2] px-5 py-3.5 rounded-2xl shadow-2xl border border-[#B69A62]/50 flex items-center space-x-3 text-xs tracking-wide pointer-events-auto">
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-[#B69A62] animate-pulse" />
        </div>
        <span className="font-medium font-sans">{toastMessage}</span>
      </div>
    </div>
  );
}
