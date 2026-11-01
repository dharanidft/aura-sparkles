"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, X, SlidersHorizontal, Sparkles, Heart } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { INITIAL_PRODUCTS, getStoreProducts, fetchStoreProducts } from "@/lib/products-data";
import { FragranceFamily, ProductCategory, Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

function ShopContent() {
  const searchParams = useSearchParams();
  const { wishlist } = useCart();

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "All");
  const [selectedFragrance, setSelectedFragrance] = useState<string>(searchParams.get("fragrance") || "All");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [showOnlyWishlist, setShowOnlyWishlist] = useState<boolean>(searchParams.get("filter") === "wishlist");

  // Load custom products and listen for updates
  useEffect(() => {
    setProducts(getStoreProducts());
    fetchStoreProducts().then((fresh) => {
      if (fresh && fresh.length > 0) setProducts(fresh);
    });
    const handleUpdate = () => setProducts(getStoreProducts());
    window.addEventListener("aura_products_updated", handleUpdate);
    return () => window.removeEventListener("aura_products_updated", handleUpdate);
  }, []);

  // Sync url search parameters
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);

    const frag = searchParams.get("fragrance");
    if (frag) setSelectedFragrance(frag);

    const q = searchParams.get("search");
    if (q) setSearchQuery(q);

    if (searchParams.get("filter") === "wishlist") {
      setShowOnlyWishlist(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedCategory && selectedCategory !== "All") {
      document.title = `${selectedCategory} Collection — Aura Sparkles`;
    } else if (showOnlyWishlist) {
      document.title = "Your Saved Wishlist — Aura Sparkles";
    } else if (searchQuery) {
      document.title = `Search: "${searchQuery}" — Aura Sparkles`;
    } else {
      document.title = "Shop Scented Candles & Home Fragrance — Aura Sparkles";
    }
  }, [selectedCategory, showOnlyWishlist, searchQuery]);

  const categories: (ProductCategory | "All")[] = [
    "All",
    "Candles",
    "Scented Candles",
    "Tea-Light Candles",
    "Decorative Candles",
    "Wax Sachets",
    "Casting Decor",
    "Pop Art Kits",
    "Gift Sets",
    "Combo Offers",
  ];

  const fragranceFamilies: (FragranceFamily | "All")[] = [
    "All",
    "Floral & Romantic",
    "Warm & Comforting",
    "Fresh & Refreshing",
    "Calm & Relaxing",
    "Earthy & Woody",
    "Rich & Resinous",
  ];

  // Also read collection filter from URL
  const collectionFilter = searchParams.get("collection") || "";

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Wishlist filter
      if (showOnlyWishlist && !wishlist.includes(product.id)) return false;

      // Collection filter (from URL)
      if (collectionFilter && product.collection !== collectionFilter) return false;

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(query);
        const matchDesc = product.description.toLowerCase().includes(query);
        const matchNotes = [
          ...product.notes.top,
          ...product.notes.heart,
          ...product.notes.base,
        ].some((n) => n.toLowerCase().includes(query));
        const matchFamily = product.fragranceFamily.toLowerCase().includes(query);
        const matchTagline = product.tagline.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchNotes && !matchFamily && !matchTagline) return false;
      }

      // Category match
      if (selectedCategory !== "All") {
        if (selectedCategory === "Candles") {
          const candleCats = ["Candles", "Scented Candles", "Tea-Light Candles", "Decorative Candles"];
          if (!candleCats.includes(product.category)) return false;
        } else if (product.category !== selectedCategory) {
          return false;
        }
      }

      // Fragrance family match
      if (selectedFragrance !== "All" && product.fragranceFamily !== selectedFragrance) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "newest") return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
    });
  }, [products, searchQuery, selectedCategory, selectedFragrance, sortBy, showOnlyWishlist, wishlist, collectionFilter]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedFragrance("All");
    setShowOnlyWishlist(false);
    setSortBy("featured");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "All" ||
    selectedFragrance !== "All" ||
    showOnlyWishlist;

  return (
    <div className="py-12 md:py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.15em] text-[#B69A62] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Aura Catalogue</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#452638] font-normal tracking-tight">
            {collectionFilter ? collectionFilter : "Shop Fragrances & Candles"}
          </h1>
          <p className="text-sm text-[#766E65] mt-2">
            {collectionFilter
              ? `Browsing: ${collectionFilter} — ${INITIAL_PRODUCTS.filter(p => p.collection === collectionFilter).length} products`
              : "37 hand-poured products · Tea-lights · Signature Jars · Gift Sets · Combo Offers"}
          </p>
        </div>

        {/* Filter & Search Bar Controls */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE0D5] shadow-subtle mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#766E65] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by scent notes (e.g. Sandalwood, Jasmine, Vanilla)..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#766E65] hover:text-[#452638]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowOnlyWishlist(!showOnlyWishlist)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-medium flex items-center space-x-1.5 transition-colors ${
                  showOnlyWishlist
                    ? "bg-[#452638] text-white border-[#452638]"
                    : "bg-white text-[#452638] border-[#EAE0D5] hover:border-[#B69A62]"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${showOnlyWishlist ? "fill-current" : ""}`} />
                <span>Saved ({wishlist.length})</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#452638] font-medium focus:outline-none focus:border-[#452638]"
              >
                <option value="featured">Featured / Bestsellers</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="space-y-2 pt-2 border-t border-[#EAE0D5]">
            <div className="flex items-center justify-between text-xs text-[#766E65]">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-[#452638]">
                Category:
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[#B69A62] hover:underline font-medium text-[11px]"
                >
                  Clear all filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-colors ${
                    selectedCategory === cat
                      ? "bg-[#452638] text-white font-medium"
                      : "bg-white border border-[#EAE0D5] text-[#766E65] hover:border-[#B69A62] hover:text-[#452638]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Fragrance Mood Filter Chips */}
          <div className="space-y-2 pt-2 border-t border-[#EAE0D5]">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-[#452638] block">
              Fragrance Family:
            </span>
            <div className="flex flex-wrap gap-2">
              {fragranceFamilies.map((fam) => (
                <button
                  key={fam}
                  onClick={() => setSelectedFragrance(fam)}
                  className={`px-3 py-1 rounded-full text-[11px] transition-colors border ${
                    selectedFragrance === fam
                      ? "bg-[#B69A62] text-white border-[#B69A62] font-medium"
                      : "bg-white text-[#766E65] border-[#EAE0D5] hover:border-[#B69A62]"
                  }`}
                >
                  {fam}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Counter & Product Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-[#766E65]">
            <span>
              Showing <strong className="text-[#452638]">{filteredProducts.length}</strong> items
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-[#EAE0D5] p-8 space-y-4">
              <SlidersHorizontal className="w-10 h-10 text-[#B69A62] mx-auto opacity-60" />
              <div className="space-y-1">
                <h3 className="font-serif text-2xl text-[#452638]">No fragrances match your filter</h3>
                <p className="text-xs text-[#766E65] max-w-sm mx-auto">
                  Try clearing some filters or searching for alternative scents like Sandalwood, Rose or Vanilla.
                </p>
              </div>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-[#452638] text-white text-xs uppercase tracking-luxury rounded-full hover:bg-[#5D354D]"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading catalogue...</div>}>
      <ShopContent />
    </Suspense>
  );
}
