"use client";

import React, { useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Sparkles, 
  Clock, 
  Flame, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  RotateCcw,
  Plus,
  Minus,
  ChevronDown,
  MapPin,
  Share2
} from "lucide-react";
import { INITIAL_PRODUCTS, getStoreProducts } from "@/lib/products-data";
import { useCart } from "@/lib/cart-context";
import { formatINR, checkIndianPincode, PincodeCheckResult } from "@/lib/shipping";
import { ProductCard } from "@/components/ProductCard";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const allProducts = typeof window !== "undefined" ? getStoreProducts() : INITIAL_PRODUCTS;
  const product = allProducts.find((p) => p.slug === slug) || INITIAL_PRODUCTS.find((p) => p.slug === slug);
  if (!product) {
    notFound();
  }

  const { addItem, toggleWishlist, isWishlisted, showToast } = useCart();
  const wishlisted = isWishlisted(product.id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincodeInput, setPincodeInput] = useState("");
  const [pincodeResult, setPincodeResult] = useState<PincodeCheckResult | null>(null);
  const [activeTab, setActiveTab] = useState<"care" | "shipping" | "reviews">("care");

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeInput.trim()) return;
    const result = checkIndianPincode(pincodeInput);
    setPincodeResult(result);
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push("/checkout");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.tagline,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Product link copied to clipboard");
    }
  };

  // Related products from same category or fragrance
  const relatedProducts = INITIAL_PRODUCTS
    .filter((p) => p.id !== product.id && (p.fragranceFamily === product.fragranceFamily || p.category === product.category))
    .slice(0, 4);

  return (
    <div className="py-10 md:py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs text-[#766E65] mb-8 font-sans">
          <Link href="/" className="hover:text-[#452638]">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#452638]">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-[#452638]">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[#452638] font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            {/* Primary Image Viewer */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-white border border-[#EAE0D5] shadow-card flex items-center justify-center p-4">
              <Image
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                fill
                className="object-contain p-4 drop-shadow-md"
                priority
              />

              {/* Aura Sparkles Authenticity Mark */}
              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#EAE0D5] shadow-sm">
                <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                  <Image src="/images/logo.png" alt="Aura Sparkles" fill className="object-contain" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#452638] leading-tight">
                    AURA SPARKLES
                  </span>
                  <span className="text-[8px] tracking-[0.12em] uppercase text-[#B69A62] font-semibold -mt-0.5">
                    Authentic Handcrafted
                  </span>
                </div>
              </div>

              <div className="absolute top-4 right-4 flex space-x-2 z-10">
                <button
                  onClick={handleShare}
                  aria-label="Share product"
                  className="p-2.5 rounded-full bg-white/90 hover:bg-white text-[#452638] backdrop-blur-sm transition-colors shadow-sm"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  className={`p-2.5 rounded-full backdrop-blur-sm transition-colors shadow-sm ${
                    wishlisted
                      ? "bg-[#452638] text-[#E8C9C5]"
                      : "bg-white/90 text-[#452638] hover:bg-white"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Bestseller Badge */}
              {product.isBestseller && (
                <span className="absolute top-4 left-4 z-10 bg-[#452638] text-white text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                  Signature Bestseller
                </span>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white p-1 ${
                      activeImageIndex === idx
                        ? "border-[#452638] shadow-sm"
                        : "border-[#EAE0D5] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Information & Purchase Controls */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="space-y-2 border-b border-[#EAE0D5] pb-5">
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">
                  {product.fragranceFamily}
                </span>
                <span className="text-xs text-[#766E65]">•</span>
                <span className="text-xs text-[#766E65]">{product.category}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-[#452638] font-normal tracking-tight">
                {product.name}
              </h1>

              <p className="text-sm text-[#766E65] font-light leading-relaxed">
                {product.tagline}
              </p>

              {/* Rating */}
              <div className="flex items-center space-x-2 pt-1">
                <div className="flex items-center space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#B69A62] text-[#B69A62]" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#452638]">{product.rating}</span>
                <span className="text-xs text-[#766E65]">({product.reviewCount} verified reviews)</span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="flex items-baseline space-x-3">
              <span className="font-serif text-3xl font-semibold text-[#452638]">
                {formatINR(product.price)}
              </span>
              {product.mrp > product.price && (
                <>
                  <span className="text-sm text-[#766E65] line-through">
                    MRP {formatINR(product.mrp)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Introductory Special Price
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-[#766E65]">Inclusive of all taxes. Free express shipping on orders above ₹499.</p>

            {/* Key Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white rounded-xl border border-[#EAE0D5] text-xs">
              <div>
                <p className="text-[#766E65] text-[10px] uppercase">Net Quantity</p>
                <p className="font-semibold text-[#452638] mt-0.5">{product.netWeight}</p>
              </div>
              <div>
                <p className="text-[#766E65] text-[10px] uppercase">Burn Time</p>
                <p className="font-semibold text-[#452638] mt-0.5">{product.burnTime}</p>
              </div>
              <div>
                <p className="text-[#766E65] text-[10px] uppercase">Wax Type</p>
                <p className="font-semibold text-[#452638] mt-0.5">100% Pure Soy</p>
              </div>
              <div>
                <p className="text-[#766E65] text-[10px] uppercase">Container</p>
                <p className="font-semibold text-[#452638] mt-0.5">Frosted Glass</p>
              </div>
            </div>

            {/* Scent Notes Pyramid */}
            <div className="p-4 bg-[#F2E9DF]/40 rounded-xl border border-[#E8C9C5]/50 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-luxury text-[#452638]">
                Fragrance Note Pyramid
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div className="border-r border-[#EAE0D5] pr-2">
                  <span className="text-[10px] uppercase font-bold text-[#B69A62]">Top Notes</span>
                  <p className="text-[#452638] font-medium mt-0.5">{product.notes.top.join(", ")}</p>
                </div>
                <div className="border-r border-[#EAE0D5] px-2">
                  <span className="text-[10px] uppercase font-bold text-[#B69A62]">Heart Notes</span>
                  <p className="text-[#452638] font-medium mt-0.5">{product.notes.heart.join(", ")}</p>
                </div>
                <div className="pl-2">
                  <span className="text-[10px] uppercase font-bold text-[#B69A62]">Base Notes</span>
                  <p className="text-[#452638] font-medium mt-0.5">{product.notes.base.join(", ")}</p>
                </div>
              </div>
            </div>

            {/* Purchase Controls */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                <span className="text-xs font-medium text-[#452638]">Quantity:</span>
                <div className="flex items-center border border-[#EAE0D5] rounded-full px-3 py-1.5 bg-white shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-[#766E65] hover:text-[#452638] p-1"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold px-3 text-[#452638]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-[#766E65] hover:text-[#452638] p-1"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-emerald-700 font-medium flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  In Stock ({product.stockCount} jars available)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="py-4 bg-white hover:bg-slate-50 text-[#452638] border-2 border-[#452638] text-xs font-semibold tracking-luxury uppercase rounded-xl flex items-center justify-center space-x-2 transition-all shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4 text-[#B69A62]" />
                  <span>ADD TO BAG</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="py-4 bg-[#452638] hover:bg-[#5D354D] text-white text-xs font-semibold tracking-luxury uppercase rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg"
                >
                  <Sparkles className="w-4 h-4 text-[#B69A62]" />
                  <span>BUY NOW</span>
                </button>
              </div>
            </div>

            {/* Indian PIN Code Checker */}
            <div className="p-4 bg-white rounded-xl border border-[#EAE0D5] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#452638] flex items-center">
                  <Truck className="w-4 h-4 text-[#B69A62] mr-1.5" />
                  Check Delivery Date in Your Area
                </span>
                <span className="text-[11px] text-[#766E65]">All India PIN codes</span>
              </div>

              <form onSubmit={handlePincodeCheck} className="flex space-x-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value)}
                  placeholder="Enter 6-digit PIN code (e.g. 560001, 110001)"
                  className="flex-1 px-3 py-2 bg-white border border-[#EAE0D5] rounded-lg text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F2E9DF] hover:bg-[#E8C9C5] text-[#452638] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
                >
                  Check
                </button>
              </form>

              {pincodeResult && (
                <div className={`p-2.5 rounded-lg text-xs ${
                  pincodeResult.isServiceable
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  <p className="font-medium">{pincodeResult.message}</p>
                  {pincodeResult.city && (
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Serviceable to {pincodeResult.city}, {pincodeResult.state} via {pincodeResult.courierPartner}.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Detail Tabs: Candle Care & Shipping */}
            <div className="border-t border-[#EAE0D5] pt-4 space-y-3">
              <div className="flex border-b border-[#EAE0D5] space-x-6 text-xs font-semibold uppercase tracking-luxury">
                <button
                  onClick={() => setActiveTab("care")}
                  className={`pb-2 transition-colors relative ${
                    activeTab === "care" ? "text-[#452638]" : "text-[#766E65] hover:text-[#452638]"
                  }`}
                >
                  Candle Care
                  {activeTab === "care" && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#452638]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("shipping")}
                  className={`pb-2 transition-colors relative ${
                    activeTab === "shipping" ? "text-[#452638]" : "text-[#766E65] hover:text-[#452638]"
                  }`}
                >
                  Shipping & Returns
                  {activeTab === "shipping" && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#452638]" />
                  )}
                </button>
              </div>

              <div className="text-xs text-[#766E65] leading-relaxed pt-2">
                {activeTab === "care" && (
                  <ul className="space-y-1.5 list-disc pl-4">
                    {product.careInstructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                )}
                {activeTab === "shipping" && (
                  <div className="space-y-2">
                    <p>
                      <strong>Dispatches in 24 Hours:</strong> Orders placed before 2 PM IST are packaged same day.
                    </p>
                    <p>
                      <strong>Standard Transit:</strong> 2-3 business days for major Indian metros, 4-5 days for all other destinations.
                    </p>
                    <p>
                      <strong>Hassle-Free Replacement:</strong> In the rare event of transit damage, notify us within 48 hours for immediate replacement.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-[#EAE0D5]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">
                  Complementary Aromas
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#452638] font-normal">
                  You May Also Love
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-xs uppercase tracking-luxury text-[#452638] hover:text-[#B69A62] font-semibold border-b border-[#452638] pb-0.5"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
