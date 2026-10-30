"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, ShieldCheck } from "lucide-react";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only display if consent hasn't been recorded yet
    const storedConsent = localStorage.getItem("aura_cookie_consent");
    if (!storedConsent) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("aura_cookie_consent", "all");
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("aura_cookie_consent", "essential");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-[#FAF7F2]/95 backdrop-blur-md border border-[#EAE0D5] p-5 rounded-2xl shadow-luxury text-[#452638] space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E8C9C5]/30 flex items-center justify-center text-[#B69A62] flex-shrink-0">
              <Cookie className="w-4 h-4 text-[#B69A62]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-luxury text-[#452638]">
                Cookie &amp; Privacy Notice
              </p>
              <span className="text-[10px] text-[#B69A62] flex items-center mt-0.5">
                <ShieldCheck className="w-3 h-3 mr-1" /> Essential session security
              </span>
            </div>
          </div>
          <button
            onClick={handleAcceptEssential}
            className="text-[#766E65] hover:text-[#452638] p-1 rounded-lg transition-colors"
            aria-label="Dismiss cookie notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-[#766E65] leading-relaxed">
          We use essential cookies to maintain your shopping bag, secure sign-in sessions, and provide a seamless luxury home fragrance experience. Read our{" "}
          <Link
            href="/privacy-policy"
            className="text-[#452638] font-semibold underline hover:text-[#B69A62] transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <div className="flex items-center space-x-2 pt-1">
          <button
            onClick={handleAcceptAll}
            className="flex-1 py-2 px-3 bg-[#452638] hover:bg-[#5D354D] text-white text-[11px] font-semibold uppercase tracking-wider rounded-xl transition-all shadow-xs"
          >
            Accept All
          </button>
          <button
            onClick={handleAcceptEssential}
            className="py-2 px-3 bg-white hover:bg-neutral-50 text-[#452638] border border-[#EAE0D5] text-[11px] font-medium rounded-xl transition-colors"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
