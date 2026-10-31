"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  Tag, 
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatINR, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";

export function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    totalItemsCount,
    subtotal,
    discount,
    shippingFee,
    finalTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  // Animation lifecycle state machine for smooth entrance & exit
  const [shouldRender, setShouldRender] = useState(isCartOpen);
  const [isClosing, setIsClosing] = useState(false);

  // Apple Direct Manipulation: 1:1 Swipe & Momentum Dismissal
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const currentDragX = useRef(0);
  const lastMoveX = useRef(0);
  const lastMoveTime = useRef(0);
  const velocityX = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isCartOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender && !isClosing) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 280);
      return () => clearTimeout(timer);
    }
  }, [isCartOpen, shouldRender, isClosing]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsCartOpen(false);
      setShouldRender(false);
      setIsClosing(false);
    }, 280);
  }, [isClosing, setIsCartOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!shouldRender) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shouldRender, handleClose]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput("");
    }
  };

  const netSubtotal = Math.max(0, subtotal - discount);
  const progressRatio = Math.min(1, Math.max(0, netSubtotal / FREE_SHIPPING_THRESHOLD));
  const progressPercent = Math.round(progressRatio * 100);
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - netSubtotal);
  const isUnlocked = amountNeeded === 0;

  // Apple Direct Manipulation: 1:1 Swipe & Momentum Dismissal
  // ---------------------------------------------------------------------------
  // Apple WWDC 2018 Rubberband Formula
  const calculateRubberbandX = (overshoot: number, dimension = 400) => {
    return (overshoot * dimension * 0.55) / (dimension + 0.55 * Math.abs(overshoot));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    drawer.setPointerCapture(e.pointerId);
    dragStartX.current = e.clientX;
    lastMoveX.current = e.clientX;
    lastMoveTime.current = performance.now();
    velocityX.current = 0;
    setIsDragging(true);
    drawer.style.transition = "none";
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    const now = performance.now();
    const dt = Math.max(1, now - lastMoveTime.current);
    const dx = e.clientX - lastMoveX.current;
    velocityX.current = dx / dt;
    lastMoveX.current = e.clientX;
    lastMoveTime.current = now;

    const rawDelta = e.clientX - dragStartX.current;
    // Dragging right: 1:1 tracking
    // Dragging left: rubberband resistance
    const finalX = rawDelta > 0 ? rawDelta : calculateRubberbandX(rawDelta);
    currentDragX.current = finalX;
    drawer.style.transform = `translate3d(${finalX}px, 0, 0)`;

    if (backdropRef.current && finalX > 0) {
      const opacity = Math.max(0, 0.5 * (1 - finalX / 400));
      backdropRef.current.style.opacity = `${opacity}`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    const drawer = drawerRef.current;
    if (!drawer) return;

    try {
      drawer.releasePointerCapture(e.pointerId);
    } catch {}

    const deltaX = currentDragX.current;
    const v = velocityX.current;
    // Dismiss if dragged right > 100px OR flicked with velocity > 0.35
    const shouldDismiss = deltaX > 100 || v > 0.35;

    if (shouldDismiss) {
      drawer.style.transition = "transform 0.24s cubic-bezier(0.23, 1, 0.32, 1)";
      drawer.style.transform = "translate3d(100%, 0, 0)";
      if (backdropRef.current) {
        backdropRef.current.style.transition = "opacity 0.22s var(--ease-out)";
        backdropRef.current.style.opacity = "0";
      }
      setTimeout(() => {
        setIsCartOpen(false);
        setShouldRender(false);
        setIsClosing(false);
      }, 240);
    } else {
      // Spring smoothly back to rest (0)
      drawer.style.transition = "transform 0.34s cubic-bezier(0.32, 0.72, 0, 1)";
      drawer.style.transform = "translate3d(0, 0, 0)";
      if (backdropRef.current) {
        backdropRef.current.style.transition = "opacity 0.28s var(--ease-out)";
        backdropRef.current.style.opacity = "1";
      }
    }
    currentDragX.current = 0;
  };

  if (!shouldRender) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag Drawer"
    >
      {/* Backdrop with smooth cubic-bezier fade in/out */}
      <div
        ref={backdropRef}
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity ${
          isClosing ? "animate-backdrop-out" : "animate-backdrop-in"
        }`}
        onClick={handleClose}
      />

      {/* Drawer Container with GPU-accelerated slide in/out & 100dvh */}
      <div 
        ref={drawerRef}
        className={`relative w-full max-w-md bg-white h-[100dvh] shadow-2xl flex flex-col z-10 ${
          isClosing ? "animate-drawer-out" : "animate-drawer-in"
        }`}
        style={{ willChange: "transform" }}
      >
        {/* Apple Direct Manipulation Drag Surface on Header */}
        <div 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="p-5 border-b border-[#EAE0D5] flex items-center justify-between bg-white cursor-grab active:cursor-grabbing select-none touch-pan-y"
          aria-label="Drag right to dismiss shopping bag"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#452638]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-medium tracking-wide text-[#452638]">
                Your Shopping Bag
              </h2>
              <span className="text-[11px] text-[#766E65] font-sans">
                {totalItemsCount} {totalItemsCount === 1 ? "handcrafted piece" : "handcrafted pieces"}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close shopping bag"
            className="w-10 h-10 flex items-center justify-center text-[#766E65] hover:text-[#452638] rounded-full hover:bg-neutral-100 active:scale-90 transition-all duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator (GPU-composited scaleX transition) */}
        <div className="p-4 bg-[#FAF7F2]/60 border-b border-[#EAE0D5]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#452638] font-medium flex items-center transition-all duration-300">
              {isUnlocked ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5 flex-shrink-0 animate-scale" />
                  <span className="font-semibold text-emerald-800">
                    🎉 Free Doorstep Delivery Unlocked!
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#B69A62] mr-1.5 flex-shrink-0" />
                  <span>
                    Add <strong className="text-[#452638]">{formatINR(amountNeeded)}</strong> more for <strong>FREE Delivery</strong> across India
                  </span>
                </>
              )}
            </span>
            <span className={`text-[11px] font-bold font-mono transition-colors ${
              isUnlocked ? "text-emerald-700" : "text-[#B69A62]"
            }`}>
              {progressPercent}%
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full bg-[#EAE0D5] h-2 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full ${
                isUnlocked
                  ? "animate-unlock-sweep shadow-[0_0_12px_rgba(182,154,98,0.5)]"
                  : "bg-[#452638]"
              }`}
              style={{
                width: "100%",
                transform: `scaleX(${progressRatio})`,
                transformOrigin: "left",
                transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                willChange: "transform",
              }}
            />
          </div>
        </div>

        {/* Cart Item List with contained overscroll to prevent rubberband chaining */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-3.5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EAE0D5] flex items-center justify-center text-[#B69A62]">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="font-serif text-xl text-[#452638]">Your shopping bag is empty</p>
                <p className="text-xs text-[#766E65] max-w-xs leading-relaxed">
                  Explore our handcrafted soy wax candles, wardrobe wax sachets, and gift hampers starting at ₹160.
                </p>
              </div>
              <Link
                href="/shop"
                onClick={handleClose}
                className="mt-4 px-7 py-3 bg-[#452638] hover:bg-[#5D354D] active:scale-95 text-[#FAF7F2] text-xs uppercase tracking-luxury rounded-full transition-all shadow-md"
              >
                Explore Fragrances
              </Link>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.product.id}
                className="flex items-center space-x-3.5 p-3 rounded-xl border border-[#EAE0D5] bg-white shadow-xs hover:border-[#B69A62]/40 transition-all duration-300"
                style={{
                  animation: `fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 40}ms forwards`,
                }}
              >
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white border border-[#EAE0D5] flex-shrink-0 p-1">
                  <Image
                    src={item.product.images[0] || "/images/logo.png"}
                    alt={item.product.name}
                    fill
                    className="object-contain p-0.5"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-sm font-medium text-[#452638] truncate font-serif">
                    {item.product.name}
                  </h3>
                  <p className="text-[11px] text-[#766E65] truncate">
                    {item.product.netWeight} · {item.product.fragranceFamily}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-[#452638] tabular-nums">
                      {formatINR(item.product.price)}
                    </span>
                    {item.product.mrp > item.product.price && (
                      <span className="text-xs text-[#766E65] line-through tabular-nums">
                        {formatINR(item.product.mrp)}
                      </span>
                    )}
                  </div>

                  {/* Quantity selector with accessible touch areas & tactile press feedback */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center border border-[#EAE0D5] rounded-full px-1 py-0.5 bg-white shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-[#766E65] hover:text-[#452638] rounded-full hover:bg-neutral-100 active:scale-85 transition-all duration-150"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold px-2 text-[#452638] min-w-[20px] text-center select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-[#766E65] hover:text-[#452638] rounded-full hover:bg-neutral-100 active:scale-85 transition-all duration-150"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="w-8 h-8 flex items-center justify-center text-[#766E65] hover:text-rose-600 rounded-full hover:bg-rose-50 active:scale-85 transition-all duration-150"
                      aria-label={`Remove ${item.product.name} from shopping bag`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Area with safe-area support */}
        {items.length > 0 && (
          <div className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] border-t border-[#EAE0D5] bg-white space-y-4 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
            {/* Promo Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-[#FAF7F2] rounded-xl border border-[#B69A62]/30 text-xs text-[#452638] animate-fadeIn">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-[#B69A62]" />
                    <span className="font-semibold uppercase tracking-wider tabular-nums">
                      {appliedCoupon.code} applied ({formatINR(discount)} saved)
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 hover:underline font-medium p-1"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                  <label htmlFor="cart-coupon-input" className="sr-only">
                    Discount coupon code
                  </label>
                  <input
                    id="cart-coupon-input"
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Discount code (e.g. AURA10)"
                    className="flex-1 px-3 py-2 bg-white border border-[#EAE0D5] rounded-xl text-xs uppercase focus:outline-none focus:border-[#452638] transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EAE0D5] active:scale-95 text-[#452638] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap"
                  >
                    Apply Code
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-[#766E65] pt-2 border-t border-[#EAE0D5]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#452638] font-medium tabular-nums">{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount</span>
                  <span className="tabular-nums">-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className={`tabular-nums ${shippingFee === 0 ? "text-emerald-700 font-semibold" : ""}`}>
                  {shippingFee === 0 ? "FREE" : formatINR(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#452638] pt-2 border-t border-[#EAE0D5]">
                <span>Total Amount</span>
                <span className="font-serif text-base tabular-nums">{formatINR(finalTotal)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-1">
              <Link
                href="/checkout"
                onClick={handleClose}
                className="group w-full py-3.5 bg-[#452638] hover:bg-[#5D354D] active:scale-[0.98] text-[#FAF7F2] text-xs font-semibold tracking-luxury uppercase rounded-full flex items-center justify-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#B69A62] group-hover:translate-x-1 transition-transform duration-200" />
              </Link>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-[#766E65]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B69A62]" />
                <span>100% Secure Checkout with UPI, Cards &amp; COD</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
