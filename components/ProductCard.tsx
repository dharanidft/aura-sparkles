"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Star, Sparkles } from "lucide-react";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/shipping";
import { getProductReviewStats } from "@/lib/reviews";

interface ProductCardProps {
  product: Product;
  delay?: number;
}

export function ProductCard({ product, delay = 0 }: ProductCardProps) {
  const { addItem, toggleWishlist, isWishlisted } = useCart();
  const wishlisted = isWishlisted(product.id);
  const [adding, setAdding] = useState(false);
  const primaryImage = product.images?.[0] || "/images/logo.png";
  const [imgSrc, setImgSrc] = useState(primaryImage);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImgSrc(product.images?.[0] || "/images/logo.png");
  }, [product.images]);

  // Requirement 4: Calculate rating strictly from real stored review data
  const [reviewStats, setReviewStats] = useState<{ count: number; averageRating: number | null }>({
    count: 0,
    averageRating: null,
  });

  useEffect(() => {
    const updateStats = () => {
      setReviewStats(getProductReviewStats(product.id));
    };
    updateStats();
    window.addEventListener("aura_reviews_updated", updateStats);
    return () => window.removeEventListener("aura_reviews_updated", updateStats);
  }, [product.id]);

  const handleAdd = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (adding) return;
    setAdding(true);
    addItem(product, 1);
    setTimeout(() => setAdding(false), 900);
  };

  // 3D tilt on hover (gated strictly to fine pointer / mouse devices to prevent sticky tilt on touch)
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    el.style.transform = `perspective(700px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px)`;
  };
  const onLeave = () => {
    const el = cardRef.current;
    if (el) el.style.transform = "perspective(700px) rotateX(0) rotateY(0) translateY(0)";
  };

  return (
    <div
      ref={cardRef}
      className="group flex flex-col bg-white rounded-xl overflow-hidden border border-[#EAE0D5] hover:border-[#E8C9C5] shadow-sm hover:shadow-xl card-tilt cursor-default transition-all duration-300"
      style={{
        transitionDelay: `${delay}ms`,
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Image container with uncropped object-contain display on pure white */}
      <div className="relative aspect-[4/5] bg-white overflow-hidden flex items-center justify-center p-2 border-b border-[#EAE0D5]/40">
        <Link href={`/shop/${product.slug}`} className="block w-full h-full relative">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized={!imgSrc.startsWith("/uploads/") && !imgSrc.startsWith("/images/")}
            onError={() => setImgSrc("/images/logo.png")}
            className="object-contain p-2.5 group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-sm"
          />

          {/* shimmer overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </Link>

        {/* Aura Sparkles Authenticity Seal & Badges (Top Left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md shadow-xs border border-[#EAE0D5] group-hover:border-[#B69A62]/60 transition-colors">
            <div className="relative w-3.5 h-3.5 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="Aura Sparkles Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-[8.5px] font-bold tracking-wider uppercase text-[#452638]">
              Aura Sparkles
            </span>
          </div>

          {product.isBestseller && (
            <span className="self-start bg-[#452638] text-white text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              Bestseller
            </span>
          )}
          {product.isNewArrival && (
            <span className="self-start bg-[#B69A62] text-white text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              New
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-10 ${
            wishlisted
              ? "bg-[#452638] text-[#E8C9C5] scale-110"
              : "bg-white/90 text-[#452638] hover:bg-white hover:text-[#B69A62] hover:scale-110 shadow-sm"
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform ${wishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Quick Add Overlay — slides up (crisp 200ms ease-out per Emil Kowalski rule) */}
        <div className="absolute inset-x-3 bottom-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 ease-out z-10 hidden sm:block">
          <button
            onClick={handleAdd}
            className={`w-full py-2.5 text-[#FAF7F2] text-xs font-semibold uppercase tracking-[0.12em] rounded-lg shadow-md backdrop-blur-sm flex items-center justify-center space-x-2 active:scale-[0.97] transition-all duration-150 ${
              adding
                ? "bg-emerald-700 scale-95"
                : "bg-[#452638]/95 hover:bg-[#452638]"
            }`}
          >
            {adding ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#B69A62] animate-spin-slow" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#B69A62]" />
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#766E65]">
            <span className="uppercase tracking-wider font-medium text-[#B69A62]">
              {product.fragranceFamily}
            </span>
            
            {/* Requirement 4: Honest Rating Display based on real reviews */}
            {reviewStats.count > 0 ? (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 fill-[#B69A62] text-[#B69A62]" />
                <span className="font-semibold text-[#452638]">{reviewStats.averageRating}</span>
                <span>({reviewStats.count})</span>
              </div>
            ) : (
              <span className="text-[10px] text-[#766E65]/70 italic">Soy Wax</span>
            )}
          </div>

          <Link href={`/shop/${product.slug}`} className="block">
            <h3 className="font-serif text-lg font-medium text-[#452638] group-hover:text-[#B69A62] transition-colors duration-300 leading-snug">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-[#766E65] line-clamp-1 italic font-light">
            {product.tagline}
          </p>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-2 border-t border-[#EAE0D5]/60 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="font-serif text-lg font-bold text-[#452638] tabular-nums">
                {formatINR(product.price)}
              </span>
              {product.mrp > product.price && (
                <span className="text-xs text-[#766E65] line-through font-light tabular-nums">
                  {formatINR(product.mrp)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#766E65] mt-0.5 font-medium">{product.netWeight}</p>
          </div>

          {/* Mobile Quick Add */}
          <button
            onClick={handleAdd}
            className={`sm:hidden w-9 h-9 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center text-white active:scale-90 transition-all duration-150 shadow-sm ${
              adding ? "bg-emerald-700" : "bg-[#452638] hover:bg-[#5D354D]"
            }`}
            aria-label={`Add ${product.name} to bag`}
          >
            {adding ? (
              <Sparkles className="w-4 h-4 text-[#B69A62] animate-pulse" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
