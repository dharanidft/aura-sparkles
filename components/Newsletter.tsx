"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setErrorMessage("Please enter a complete email address (e.g. name@example.com).");
      return;
    }

    setStatus("loading");
    // Simulate real subscriber registration
    setTimeout(() => {
      try {
        const subscribers = JSON.parse(localStorage.getItem("aura_subscribers") || "[]");
        if (!subscribers.includes(email.trim().toLowerCase())) {
          subscribers.push(email.trim().toLowerCase());
          localStorage.setItem("aura_subscribers", JSON.stringify(subscribers));
        }
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setErrorMessage("Unable to save subscription. Please try again.");
      }
    }, 600);
  };

  return (
    <section className="py-20 bg-white border-b border-[#EAE0D5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E8C9C5]/30 text-[#452638] text-[11px] font-semibold tracking-luxury uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#B69A62]" />
          <span>JOIN THE AURA CIRCLE</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl text-[#452638] font-normal tracking-tight">
          Gentle Scents &amp; Thoughtful Living in Your Inbox
        </h2>

        <p className="text-sm text-[#766E65] max-w-lg mx-auto leading-relaxed">
          Be the first to explore limited seasonal candle drops, candle care rituals, and gifting ideas. Enjoy ₹50 off your first handcrafted order.
        </p>

        {status === "success" ? (
          <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm max-w-md mx-auto space-y-2 animate-fadeIn">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-serif text-xl text-[#452638]">Welcome to the AURA Circle</p>
            <p className="text-xs text-[#766E65]">
              Thank you for subscribing! Use code <span className="font-bold text-[#452638]">WELCOME50</span> for flat ₹50 off on your first order.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="yourname@example.com"
                className="flex-1 px-5 py-3.5 bg-white border border-[#E8C9C5] rounded-full text-xs text-[#282522] focus:outline-none focus:border-[#452638] focus:ring-1 focus:ring-[#452638] shadow-sm"
                required
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-7 py-3.5 bg-[#452638] hover:bg-[#5D354D] active:scale-[0.98] text-[#FAF7F2] text-xs font-semibold tracking-luxury uppercase rounded-full shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                <span>{status === "loading" ? "Subscribing..." : "Get ₹50 Voucher"}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B69A62]" />
              </button>
            </div>

            {status === "error" && (
              <p className="text-xs text-red-600 text-left pl-3">{errorMessage}</p>
            )}

            <p className="text-[11px] text-[#766E65]/80 font-light">
              No spam, ever. Unsubscribe anytime with a single click.
            </p>
          </form>
        )}

      </div>
    </section>
  );
}
