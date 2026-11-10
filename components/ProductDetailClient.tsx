"use client";

import React, { useState, useEffect, useRef } from "react";
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
  MapPin,
  Share2,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info
} from "lucide-react";
import { Product } from "@/lib/types";
import { getStoreProducts } from "@/lib/products-data";
import { useCart } from "@/lib/cart-context";
import { formatINR, checkIndianPincode, PincodeCheckResult, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { ProductCard } from "@/components/ProductCard";
import { SafeImage } from "@/components/SafeImage";
import { 
  getStoredReviews, 
  getProductReviewStats, 
  submitProductReview, 
  verifyQualifyingOrder,
  Review 
} from "@/lib/reviews";
import { trackViewItem, trackAddToCart } from "@/lib/analytics";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { addItem, toggleWishlist, isWishlisted, showToast } = useCart();
  const wishlisted = isWishlisted(product.id);

  const [currentProduct, setCurrentProduct] = useState<Product>(product);

  useEffect(() => {
    setCurrentProduct(product);
  }, [product]);

  useEffect(() => {
    const handleStoreUpdate = () => {
      const storeProducts = getStoreProducts();
      const updated = storeProducts.find((p) => p.id === product.id || p.slug === product.slug);
      if (updated) {
        setCurrentProduct(updated);
      }
    };
    window.addEventListener("aura_products_updated", handleStoreUpdate);
    return () => window.removeEventListener("aura_products_updated", handleStoreUpdate);
  }, [product.id, product.slug]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincodeInput, setPincodeInput] = useState("");
  const [pincodeResult, setPincodeResult] = useState<PincodeCheckResult | null>(null);
  const [activeTab, setActiveTab] = useState<"care" | "shipping" | "reviews">("care");

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<{ count: number; averageRating: number | null }>({
    count: 0,
    averageRating: null,
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewOrderId, setReviewOrderId] = useState("");
  const [reviewPhotoUrl, setReviewPhotoUrl] = useState("");
  const [orderVerificationFeedback, setOrderVerificationFeedback] = useState<string | null>(null);
  const [formFeedback, setFormFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const reviewsSectionRef = useRef<HTMLDivElement>(null);
  const buySectionRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showBurnerGuide, setShowBurnerGuide] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!buySectionRef.current) return;
      const rect = buySectionRef.current.getBoundingClientRect();
      setShowStickyBar(rect.bottom < 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    trackViewItem(product);
  }, [product.id]);

  // Apple Direct Manipulation: Image Swipe Gesture Tracking
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const imgLen = currentProduct.images?.length || 0;
    if (diff > 40 && imgLen > 1) {
      // Swiped Left -> Next Image
      setActiveImageIndex((prev) => (prev + 1) % imgLen);
    } else if (diff < -40 && imgLen > 1) {
      // Swiped Right -> Previous Image
      setActiveImageIndex((prev) => (prev - 1 + imgLen) % imgLen);
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Sync title and reviews on mount
  useEffect(() => {
    const sizeStr = product.sizeVariant || product.netWeight.split("/")[0].trim();
    document.title = `${product.name}, ${sizeStr} — Aura Sparkles`;

    const loadReviews = () => {
      const stored = getStoredReviews(product.id);
      setReviews(stored);
      setReviewStats(getProductReviewStats(product.id));
    };

    loadReviews();
    window.addEventListener("aura_reviews_updated", loadReviews);
    return () => window.removeEventListener("aura_reviews_updated", loadReviews);
  }, [product]);

  const scrollToReviews = () => {
    setActiveTab("reviews");
    if (reviewsSectionRef.current) {
      reviewsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeInput.trim()) return;
    const res = checkIndianPincode(pincodeInput);
    setPincodeResult(res);
  };

  const handleVerifyOrderInput = () => {
    if (!reviewOrderId.trim()) {
      setOrderVerificationFeedback(null);
      return;
    }
    const check = verifyQualifyingOrder(reviewOrderId, product.id);
    setOrderVerificationFeedback(check.message);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    if (!reviewerName.trim() || !reviewComment.trim()) {
      setFormFeedback({ text: "Please enter your name and review comments.", isError: true });
      return;
    }

    const res = submitProductReview({
      productId: product.id,
      reviewerName: reviewerName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
      orderId: reviewOrderId.trim() || undefined,
      images: reviewPhotoUrl.trim() ? [reviewPhotoUrl.trim()] : undefined,
    });

    if (res.success) {
      setFormFeedback({ text: res.message, isError: false });
      setReviewerName("");
      setReviewComment("");
      setReviewOrderId("");
      setReviewPhotoUrl("");
      setOrderVerificationFeedback(null);
      setTimeout(() => {
        setShowReviewForm(false);
        setFormFeedback(null);
      }, 2500);
    } else {
      setFormFeedback({ text: res.message, isError: true });
    }
  };

  return (
    <div className="pt-10 pb-28 md:py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="text-xs text-[#766E65] mb-8 flex items-center space-x-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#452638] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#452638] transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-[#452638] transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[#452638] font-medium truncate">{product.name}</span>
        </nav>

        {/* Product Hero Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Image Gallery (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div 
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden border border-[#D6D3D1] shadow-card flex items-center justify-center p-3 select-none touch-pan-y group"
              aria-label="Product image gallery"
            >
              <SafeImage
                src={currentProduct.images?.[activeImageIndex] || currentProduct.images?.[0] || ""}
                alt={`${currentProduct.name} - ${currentProduct.sizeVariant || "View"}`}
                fallbackTitle={currentProduct.name}
                className="w-full h-full object-contain p-2 transition-transform duration-300 ease-out group-hover:scale-105"
              />

              {/* Brand watermark */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-xs border border-[#D6D3D1]">
                <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                  <Image src="/images/logo.png" alt="Aura Sparkles Logo" fill className="object-contain" />
                </div>
                <span className="text-[9px] font-bold tracking-wider uppercase text-[#1C1917]">
                  AURA SPARKLES
                </span>
              </div>

              {/* Mobile pagination dots */}
              {(currentProduct.images?.length || 0) > 1 && (
                <div className="absolute bottom-3 inset-x-0 flex justify-center space-x-1.5 z-10 sm:hidden">
                  {currentProduct.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      aria-label={`Show image ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        activeImageIndex === i ? "w-5 bg-[#1C1917]" : "w-1.5 bg-[#D6D3D1]"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {(currentProduct.images?.length || 0) > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-1">
                {currentProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all p-1 bg-white cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-[#1C1917] shadow-sm ring-2 ring-[#A16207]/30"
                        : "border-[#D6D3D1] hover:border-[#A16207]"
                    }`}
                  >
                    <SafeImage
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fallbackTitle={currentProduct.name}
                      className="w-full h-full object-contain p-0.5"
                    />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Right Column: Product Narrative, Pricing & Purchase (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-2 border-b border-[#EAE0D5] pb-5">
              <div className="flex items-center space-x-2 text-xs uppercase tracking-[0.14em] text-[#B69A62] font-semibold">
                <span>{product.fragranceFamily}</span>
                <span>•</span>
                <span>{product.category}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-[#452638] font-normal tracking-tight">
                {product.name}
              </h1>

              <p className="text-sm text-[#766E65] font-light leading-relaxed">
                {product.tagline}
              </p>

              {/* Requirement 4: Clickable rating linking directly to transparent reviews section */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={scrollToReviews}
                  aria-label="View customer reviews"
                  className="inline-flex items-center space-x-2 text-xs hover:opacity-80 transition-opacity focus:outline-none focus:ring-1 focus:ring-[#452638] rounded-sm py-0.5"
                >
                  {reviewStats.count > 0 ? (
                    <>
                      <div className="flex items-center space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(Number(reviewStats.averageRating))
                                ? "fill-[#B69A62] text-[#B69A62]"
                                : "text-neutral-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-[#452638]">{reviewStats.averageRating}</span>
                      <span className="text-[#766E65] underline">
                        ({reviewStats.count} {reviewStats.count === 1 ? "review" : "reviews"})
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-[#766E65]">
                      <Star className="w-4 h-4 text-[#B69A62]" />
                      <span className="underline font-medium text-[#452638]">
                        No reviews yet — Be the first to review
                      </span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="flex items-baseline space-x-3">
              <span className="font-serif text-3xl font-semibold text-[#452638] tabular-nums">
                {formatINR(product.price)}
              </span>
              {product.mrp > product.price && (
                <>
                  <span className="text-sm text-[#766E65] line-through tabular-nums">
                    MRP {formatINR(product.mrp)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Introductory Special Price
                  </span>
                </>
              )}
            </div>
            
            {/* Standardized free shipping statement */}
            <p className="text-[11px] text-[#766E65]">
              Inclusive of all taxes. Free shipping on orders ₹499 and above.
            </p>

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
                <p className="font-semibold text-[#452638] mt-0.5">{product.jarType || "Frosted Glass"}</p>
              </div>
            </div>

            {/* Scent Notes Olfactory Visualizer */}
            {product.notes && (
              <div className="p-5 bg-gradient-to-br from-[#FAF7F2] to-white rounded-2xl border border-[#D6D3D1] space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#A16207]" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
                      Olfactory Fragrance Pyramid
                    </p>
                  </div>
                  {/* Scent intensity indicator */}
                  <div className="flex items-center space-x-1" title="Fragrance Intensity: 4 of 5">
                    <span className="text-[10px] text-[#44403C] mr-1">Intensity:</span>
                    <div className="flex space-x-1">
                      <span className="w-2 h-2 rounded-full bg-[#A16207]" />
                      <span className="w-2 h-2 rounded-full bg-[#A16207]" />
                      <span className="w-2 h-2 rounded-full bg-[#A16207]" />
                      <span className="w-2 h-2 rounded-full bg-[#A16207]" />
                      <span className="w-2 h-2 rounded-full bg-[#D6D3D1]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-white/80 border border-[#D6D3D1] shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-[#A16207] tracking-wider block">Top Notes</span>
                    <p className="text-[#1C1917] font-medium mt-1 leading-relaxed">{product.notes.top.join(" · ")}</p>
                    <span className="text-[9px] text-[#44403C]/70 mt-1 block">First 15 mins impression</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 border border-[#D6D3D1] shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-[#A16207] tracking-wider block">Heart Notes</span>
                    <p className="text-[#1C1917] font-medium mt-1 leading-relaxed">{product.notes.heart.join(" · ")}</p>
                    <span className="text-[9px] text-[#44403C]/70 mt-1 block">Main aromatic character</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 border border-[#D6D3D1] shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-[#A16207] tracking-wider block">Base Notes</span>
                    <p className="text-[#1C1917] font-medium mt-1 leading-relaxed">{product.notes.base.join(" · ")}</p>
                    <span className="text-[9px] text-[#44403C]/70 mt-1 block">Lingering evening sillage</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#44403C] flex items-center justify-between pt-1 border-t border-[#D6D3D1]/60">
                  <span>Room throw: <strong>150–250 sq ft</strong></span>
                  <span>Pure cotton wick · Lead free</span>
                </div>
              </div>
            )}

            {/* Interactive Candle Care & Burner Guide Accordion */}
            <div className="border border-[#D6D3D1] rounded-2xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setShowBurnerGuide(!showBurnerGuide)}
                className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-[#A16207]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
                    Master Burner Guide & Candle Care
                  </span>
                </div>
                {showBurnerGuide ? (
                  <ChevronUp className="w-4 h-4 text-[#44403C]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#44403C]" />
                )}
              </button>

              {showBurnerGuide && (
                <div className="px-5 pb-4 pt-1 border-t border-[#D6D3D1]/60 space-y-2 text-xs text-[#44403C] leading-relaxed">
                  <p><strong>• Memory Burn:</strong> On first lighting, allow wax to melt fully to jar edges (approx 2 hours) to prevent tunneling.</p>
                  <p><strong>• Wick Trimming:</strong> Trim cotton wick to 6mm (1/4 inch) before each light to eliminate soot and smoke.</p>
                  <p><strong>• Safe Extinguishing:</strong> Never burn for over 4 consecutive hours. Keep away from drafts, pets, and children.</p>
                </div>
              )}
            </div>

            {/* Add to Bag and Wishlist Actions */}
            <div ref={buySectionRef} className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-[#D6D3D1] rounded-full px-3 py-2 bg-white shadow-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-[#44403C] hover:text-[#1C1917] p-1 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-semibold text-[#1C1917]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-[#44403C] hover:text-[#1C1917] p-1 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    addItem(product, quantity);
                    trackAddToCart(product, quantity, product.sizeVariant);
                  }}
                  className="flex-1 py-3.5 bg-[#A16207] hover:bg-[#854D0E] active:scale-[0.98] text-white text-xs font-semibold uppercase tracking-wider rounded-full shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition-all duration-150 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-white" />
                  <span>ADD TO SHOPPING BAG</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
                  className={`p-3.5 rounded-full border transition-all cursor-pointer ${
                    wishlisted
                      ? "bg-[#1C1917] border-[#1C1917] text-white"
                      : "bg-white border-[#D6D3D1] text-[#1C1917] hover:border-[#A16207]"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? "fill-[#A16207] text-[#A16207]" : ""}`} />
                </button>
              </div>

              {/* Delivery Guarantee Trust Badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-[#766E65] pt-2">
                <div className="p-2 rounded-lg bg-neutral-50 flex flex-col items-center">
                  <Truck className="w-4 h-4 text-[#B69A62] mb-1" />
                  <span>Free shipping on orders ₹499 and above</span>
                </div>
                <div className="p-2 rounded-lg bg-neutral-50 flex flex-col items-center">
                  <ShieldCheck className="w-4 h-4 text-[#B69A62] mb-1" />
                  <span>100% Pure Soy Wax</span>
                </div>
                <div className="p-2 rounded-lg bg-neutral-50 flex flex-col items-center">
                  <RotateCcw className="w-4 h-4 text-[#B69A62] mb-1" />
                  <span>Transit Damage Replacement</span>
                </div>
              </div>
            </div>

            {/* Pincode Check Widget */}
            <div className="p-4 bg-white rounded-xl border border-[#EAE0D5] space-y-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#452638]">
                <MapPin className="w-4 h-4 text-[#B69A62]" />
                <span>Estimate Delivery Timeline to Your City</span>
              </div>
              <form onSubmit={handlePincodeCheck} className="flex space-x-2">
                <label htmlFor="pdp-pincode" className="sr-only">
                  Delivery PIN code
                </label>
                <input
                  id="pdp-pincode"
                  type="text"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit PIN code (e.g. 600095)"
                  className="flex-1 px-3 py-2 bg-white border border-[#EAE0D5] rounded-lg text-xs focus:outline-none focus:border-[#452638]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F2E9DF] hover:bg-[#E8C9C5] text-[#452638] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap"
                >
                  Check Delivery
                </button>
              </form>

              {pincodeResult && (
                <div className="text-xs pt-1">
                  <p className="font-medium text-[#452638]">{pincodeResult.message}</p>
                  {pincodeResult.isServiceable && pincodeResult.city && (
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
                  Shipping &amp; Returns
                  {activeTab === "shipping" && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#452638]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-2 transition-colors relative ${
                    activeTab === "reviews" ? "text-[#452638]" : "text-[#766E65] hover:text-[#452638]"
                  }`}
                >
                  Customer Reviews ({reviewStats.count})
                  {activeTab === "reviews" && (
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
                      <strong>Standard Shipping:</strong> Free shipping on orders ₹499 and above. Orders below ₹499 have a standard ₹49 delivery charge.
                    </p>
                    <p>
                      <strong>Dispatches in 24 Hours:</strong> Orders placed before 2 PM IST are packaged same day.
                    </p>
                    <p>
                      <strong>Hassle-Free Replacement:</strong> If damaged in transit, notify us within 48 hours with a photo at contact@aurasparkles.com or WhatsApp (+91 98400 22902) for immediate replacement.
                    </p>
                  </div>
                )}
                {activeTab === "reviews" && (
                  <div className="space-y-2">
                    <p>
                      See the complete authentic reviews section below to read community feedback and submit your verified purchase review.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════
            REQUIREMENT 4: TRANSPARENT & ACCESSIBLE REVIEWS SECTION
           ═══════════════════════════════════════════════════════════════ */}
        <div ref={reviewsSectionRef} id="product-reviews" className="mt-20 pt-12 border-t border-[#EAE0D5] space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-luxury text-[#B69A62] font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Transparent Customer Reflections</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#452638]">
                Reviews for {product.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#766E65] max-w-xl mt-1">
                Real customer feedback. Verified Purchase badges are awarded strictly when verified against a matching store order ID.
              </p>
            </div>

            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-6 py-2.5 bg-[#452638] hover:bg-[#5D354D] text-white text-xs uppercase tracking-luxury rounded-full self-start md:self-auto transition-colors shadow-xs"
            >
              {showReviewForm ? "Close Review Form" : "Write a Review"}
            </button>
          </div>

          {/* Verification Explanation Alert */}
          <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EAE0D5] text-xs text-[#766E65] flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-[#B69A62] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#452638]">How Our Purchase Verification Works</p>
              <p className="text-[11px] leading-relaxed mt-0.5">
                To maintain complete transparency, the <strong>Verified Purchase</strong> badge is granted only when an order ID in our store database matches the reviewer and confirms that this specific fragrance was ordered. We never fabricate reviews, ratings, or reviewer photos.
              </p>
            </div>
          </div>

          {/* Review Submission Form Modal / Box */}
          {showReviewForm && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE0D5] shadow-card space-y-5 animate-fadeIn">
              <h3 className="font-serif text-xl text-[#452638] border-b border-[#EAE0D5] pb-3">
                Share Your Experience with {product.name}
              </h3>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#452638] mb-1">
                      Your Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#452638] mb-1">
                      Rating *
                    </label>
                    <div className="flex items-center space-x-2 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 transition-colors ${
                              star <= reviewRating
                                ? "fill-[#B69A62] text-[#B69A62]"
                                : "text-neutral-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs text-[#766E65] ml-2">
                        {reviewRating} of 5 Stars
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="review-order-id" className="block text-xs font-medium text-[#452638] mb-1">
                    Your Order ID (Optional) — Found on your order confirmation email or WhatsApp for Verified Buyer status
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="review-order-id"
                      type="text"
                      value={reviewOrderId}
                      onChange={(e) => setReviewOrderId(e.target.value)}
                      placeholder="e.g. AS-1234-5678"
                      className="flex-1 px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638] uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOrderInput}
                      className="px-4 py-2 bg-[#F2E9DF] hover:bg-[#E8C9C5] text-[#452638] text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
                    >
                      Verify Order
                    </button>
                  </div>
                  {orderVerificationFeedback && (
                    <p className="text-[11px] text-[#452638] mt-1 italic">
                      {orderVerificationFeedback}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="review-photo-url" className="block text-xs font-medium text-[#452638] mb-1">
                    Photo Link (Optional)
                  </label>
                  <input
                    id="review-photo-url"
                    type="url"
                    value={reviewPhotoUrl}
                    onChange={(e) => setReviewPhotoUrl(e.target.value)}
                    placeholder="https://example.com/my-candle.jpg"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                  />
                  <p className="text-[10px] text-[#766E65] mt-0.5">
                    Share an image link (e.g. Imgur or Google Drive) to show your candle setup.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#452638] mb-1">
                    Your Review &amp; Burn Experience *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share how the scent throw fills your room, the burn performance, and presentation..."
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                  />
                </div>

                {formFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                      formFeedback.isError
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {formFeedback.isError ? (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>{formFeedback.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#452638] hover:bg-[#5D354D] text-white text-xs font-semibold uppercase tracking-luxury rounded-xl transition-colors shadow-sm"
                >
                  Submit Genuine Review
                </button>
              </form>
            </div>
          )}

          {/* Reviews List or Honest Empty State */}
          {reviews.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#EAE0D5] space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#B69A62] flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6 opacity-60" />
              </div>
              <h3 className="font-serif text-xl text-[#452638]">
                No Customer Reviews Yet
              </h3>
              <p className="text-xs text-[#766E65] max-w-md mx-auto">
                We believe in genuine feedback. No reviews have been posted for this product yet. Have you enjoyed this candle? Be the first to share your experience with our community!
              </p>
              <button
                onClick={() => setShowReviewForm(true)}
                className="mt-2 px-6 py-2 border border-[#452638] hover:bg-[#452638] hover:text-white text-[#452638] text-xs font-semibold uppercase tracking-wider rounded-full transition-colors"
              >
                Be the First to Review
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 sm:p-6 bg-white rounded-2xl border border-[#EAE0D5] shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE0D5]/60 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm text-[#452638]">
                        {rev.reviewerName}
                      </span>
                      {rev.isVerifiedPurchase && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-[#766E65]">
                      <div className="flex items-center">
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
                      <span>
                        {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#282522] leading-relaxed">
                    {rev.comment}
                  </p>

                  {/* Review photos ONLY when available */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="flex space-x-3 pt-2">
                      {rev.images.map((img, i) => (
                        <div
                          key={i}
                          className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#EAE0D5] bg-neutral-50"
                        >
                          <Image
                            src={img}
                            alt={`Customer photo ${i + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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

      {/* Universal Sticky Purchase Bar with iOS safe-area support */}
      <aside 
        aria-label="Quick purchase actions" 
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#D6D3D1] px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_32px_rgba(28,25,23,0.12)] transition-transform duration-300 ${
          showStickyBar ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-[#D6D3D1] flex-shrink-0 bg-white p-1">
              <SafeImage
                src={currentProduct.images?.[0] || ""}
                alt={currentProduct.name}
                fallbackTitle={currentProduct.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-serif font-semibold text-[#1C1917] truncate">{product.name}</p>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-sm font-bold text-[#A16207] tabular-nums">{formatINR(product.price)}</span>
                {product.mrp > product.price && (
                  <span className="text-[10px] text-[#44403C]/70 line-through tabular-nums">MRP {formatINR(product.mrp)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <div className="hidden sm:flex items-center border border-[#D6D3D1] rounded-full px-2.5 py-1 bg-white">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 text-[#44403C] hover:text-[#1C1917] cursor-pointer"><Minus className="w-3 h-3" /></button>
              <span className="px-3 text-xs font-semibold text-[#1C1917]">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-1 text-[#44403C] hover:text-[#1C1917] cursor-pointer"><Plus className="w-3 h-3" /></button>
            </div>

            <button
              onClick={() => {
                addItem(product, quantity);
                trackAddToCart(product, quantity, product.sizeVariant);
              }}
              disabled={!product.inStock}
              className={`flex-shrink-0 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center space-x-2 shadow-md transition-all duration-150 cursor-pointer active:scale-95 ${
                product.inStock
                  ? "bg-[#A16207] hover:bg-[#854D0E] text-white"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>{product.inStock ? "Add to Bag" : "Out of Stock"}</span>
            </button>
          </div>
        </div>
      </aside>

      </div>
    </div>
  );
}
