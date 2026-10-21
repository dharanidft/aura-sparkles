"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, ShieldCheck, MessageSquare, ArrowRight } from "lucide-react";
import { getStoredReviews, Review } from "@/lib/reviews";

export function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const load = () => {
      setReviews(getStoredReviews());
    };
    load();
    window.addEventListener("aura_reviews_updated", load);
    return () => window.removeEventListener("aura_reviews_updated", load);
  }, []);

  return (
    <section className="py-20 bg-white border-b border-[#EAE0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="flex items-center space-x-1.5 text-xs uppercase tracking-luxury text-[#B69A62] font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Customer Reflections</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-[#452638] font-normal tracking-tight">
              Words From Our Community
            </h2>
            <p className="text-sm text-[#766E65] max-w-lg mt-2">
              Genuine reflections from homes illuminated by Aura Sparkles. Verified Purchase badges are strictly authenticated against actual store orders.
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <Link
              href="/shop"
              className="inline-flex items-center space-x-1 text-xs font-semibold uppercase tracking-luxury text-[#452638] hover:text-[#B69A62] border-b border-[#452638] pb-0.5"
            >
              <span>Explore Fragrances</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Verification Policy Banner */}
        <div className="mb-8 p-4 bg-[#FAF7F2] rounded-xl border border-[#EAE0D5] text-xs text-[#766E65] flex items-center space-x-3">
          <ShieldCheck className="w-5 h-5 text-[#B69A62] flex-shrink-0" />
          <p className="text-[11px] leading-relaxed">
            <strong>Authenticity First:</strong> We do not fabricate reviews, star ratings, or reviewer photos. Reviews marked <em>Verified Purchase</em> have been checked against genuine orders in our fulfilment system.
          </p>
        </div>

        {/* Real Reviews Grid or Honest Empty State */}
        {reviews.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#EAE0D5] max-w-2xl mx-auto space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#FAF7F2] text-[#B69A62] flex items-center justify-center mx-auto">
              <MessageSquare className="w-7 h-7 opacity-60" />
            </div>
            <h3 className="font-serif text-2xl text-[#452638]">
              Honest Feedback Welcome
            </h3>
            <p className="text-xs text-[#766E65] leading-relaxed">
              We are a dedicated home fragrance studio and hold ourselves to strict review transparency. We only show real reviews submitted by customers. If you have welcomed our soy wax candles into your home, please share your thoughts on any product page.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-block px-7 py-3 bg-[#452638] hover:bg-[#5D354D] text-white text-xs uppercase tracking-luxury rounded-full transition-colors"
              >
                View Collection &amp; Review
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((rev) => (
              <div
                key={rev.id}
                className="p-6 bg-white rounded-2xl border border-[#EAE0D5] shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? "fill-[#B69A62] text-[#B69A62]"
                              : "text-neutral-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#766E65]">
                      {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-[#282522] italic leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EAE0D5]/60 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-medium text-[#452638]">{rev.reviewerName}</p>
                  </div>
                  {rev.isVerifiedPurchase && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Verified Purchase
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
