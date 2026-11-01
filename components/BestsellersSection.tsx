"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { INITIAL_PRODUCTS, getStoreProducts, fetchStoreProducts } from "@/lib/products-data";
import { Product } from "@/lib/types";
import { useRevealContainer } from "@/lib/useScrollReveal";

export function BestsellersSection() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const headerRef = useRevealContainer<HTMLDivElement>(0.2);
  const gridRef = useRevealContainer<HTMLDivElement>(0.08);

  useEffect(() => {
    setProducts(getStoreProducts());
    fetchStoreProducts().then((fresh) => {
      if (fresh && fresh.length > 0) setProducts(fresh);
    });

    const handleUpdate = () => setProducts(getStoreProducts());
    window.addEventListener("aura_products_updated", handleUpdate);
    return () => window.removeEventListener("aura_products_updated", handleUpdate);
  }, []);

  const bestsellers = products.filter((p) => p.isBestseller).slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-white border-y border-[#EAE0D5]/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs uppercase tracking-[0.15em] text-[#B69A62] font-semibold">
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Beloved by Homes Across India</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-[#452638] font-normal tracking-tight">
              Most Loved Scented Candles
            </h2>
            <p className="text-sm text-[#766E65] max-w-lg">
              Our signature frosted-glass candles, poured with clean-burning soy wax and authentic natural botanicals.
              Special introductory pricing from ₹199.
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <Link
              href="/shop"
              className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#452638] hover:text-[#B69A62] transition-colors group"
            >
              <span className="border-b border-[#452638] group-hover:border-[#B69A62] pb-0.5 transition-colors">
                SHOP ALL PRODUCTS
              </span>
              <ArrowRight className="w-4 h-4 text-[#B69A62] group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </div>
        </div>

        {/* Products grid — each card has staggered delay */}
        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {bestsellers.map((product, idx) => (
            <ProductCard key={product.id} product={product} delay={idx * 120} />
          ))}
        </div>

      </div>
    </section>
  );
}
