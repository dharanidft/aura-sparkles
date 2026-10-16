"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Star, Sparkles } from "lucide-react";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/shipping";

interface ProductCardProps {
  product: Product;
  delay?: number;
}

export function ProductCard({ product, delay = 0 }: ProductCardProps) {
  const { addItem, toggleWishlist, isWishlisted } = useCart();
  const wishlisted = isWishlisted(product.id);
  const [adding, setAdding] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleAdd = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (adding) return;
    setAdding(true);
    addItem(product, 1);
    setTimeout(() => setAdding(false), 900);
  };

  // 3D tilt on hover
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
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

  const [imgSrc, setImgSrc] = useState(product.images[0] || "/images/logo.png");

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

        {/* Quick Add Overlay — slides up */}
        <div className="absolute inset-x-3 bottom-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 z-10 hidden sm:block">
          <button
            onClick={handleAdd}
            className={`w-full py-2.5 text-[#FAF7F2] text-xs font-semibold uppercase tracking-[0.12em] rounded-lg shadow-md backdrop-blur-sm flex items-center justify-center space-x-2 transition-all ${
              adding
                ? "bg-emerald-700 scale-95"
                : "bg-[#452638]/95 hover:bg-[#452638] hover:scale-[1.02]"
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
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 fill-[#B69A62] text-[#B69A62]" />
              <span className="font-semibold text-[#452638]">{product.rating}</span>
              <span>({product.reviewCount})</span>
            </div>
          </div>

          <Link href={`/shop/${product.slug}`} className="block">
            <h3 className="font-serif text-lg font-medium text-[#452638] group-hover:text-[#B69A62] transition-colors duration-300 leading-snug">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-[#766E65] line-clamp-1 italic font-light">
            Notes: {product.notes.heart.join(", ")}
          </p>
        </div>

        <div className="pt-2 border-t border-[#EAE0D5] flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-base font-semibold text-[#452638]">
              {formatINR(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-[#766E65] line-through">
                {formatINR(product.mrp)}
              </span>
            )}
            {product.mrp > product.price && (
              <span className="text-[10px] text-emerald-700 font-semibold">
                {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
              </span>
            )}
          </div>

          {/* Mobile direct add */}
          <button
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className={`sm:hidden p-2 rounded-full transition-all duration-300 ${
              adding ? "bg-emerald-700 scale-90" : "bg-[#452638] hover:bg-[#5D354D] hover:scale-110"
            } text-white`}
          >
            {adding ? (
              <Sparkles className="w-4 h-4 text-[#B69A62] animate-spin-slow" />
            ) : (
              <ShoppingBag className="w-4 h-4 text-[#B69A62]" />
            )}
          </button>

          <span className="hidden sm:inline-block text-[11px] text-[#766E65]">
            {product.netWeight?.split("/")[0]}
          </span>
        </div>
      </div>
    </div>
  );
}
