"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, Tag, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/shipping";

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

  if (!isCartOpen) return null;

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

  const freeShippingThreshold = 499;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeeded = freeShippingThreshold - subtotal;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slideLeft">
        {/* Header */}
        <div className="p-5 border-b border-[#EAE0D5] flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-[#452638]" />
            <h2 className="font-serif text-xl font-medium tracking-wide text-[#452638]">
              Your Shopping Bag
            </h2>
            <span className="text-xs text-[#766E65] font-sans">
              ({totalItemsCount} {totalItemsCount === 1 ? "item" : "items"})
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Close bag"
            className="p-1.5 text-[#766E65] hover:text-[#452638] rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="p-4 bg-white border-b border-[#EAE0D5]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#452638] font-medium flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-[#B69A62] mr-1.5" />
              {amountNeeded > 0
                ? `Add ${formatINR(amountNeeded)} more for Free Express Delivery`
                : "You unlocked Free Express Delivery across India!"}
            </span>
            <span className="text-[11px] font-semibold text-[#B69A62]">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-[#EAE0D5] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#452638] h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F2E9DF] flex items-center justify-center text-[#B69A62]">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="font-serif text-xl text-[#452638]">Your bag is currently empty</p>
                <p className="text-xs text-[#766E65] max-w-xs">
                  Discover our pure soy wax candles and botanical home fragrances.
                </p>
              </div>
              <Link
                href="/shop"
                onClick={() => setIsCartOpen(false)}
                className="mt-4 px-6 py-2.5 bg-[#452638] hover:bg-[#5D354D] text-[#FAF7F2] text-xs uppercase tracking-luxury rounded-full transition-colors"
              >
                Explore Fragrances
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center space-x-4 p-3 rounded-lg border border-[#EAE0D5] bg-white shadow-subtle hover:border-[#E8C9C5] transition-colors"
              >
                <div className="relative w-20 h-20 rounded-md overflow-hidden bg-white border border-[#EAE0D5] flex-shrink-0 p-1">
                  <Image
                    src={item.product.images[0] || "/images/logo.png"}
                    alt={item.product.name}
                    fill
                    className="object-contain p-0.5"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-[#452638] truncate font-serif">
                    {item.product.name}
                  </h3>
                  <p className="text-[11px] text-[#766E65] truncate">
                    {item.product.netWeight} · {item.product.fragranceFamily}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm font-semibold text-[#452638]">
                      {formatINR(item.product.price)}
                    </span>
                    {item.product.mrp > item.product.price && (
                      <span className="text-xs text-[#766E65] line-through">
                        {formatINR(item.product.mrp)}
                      </span>
                    )}
                  </div>
                  {/* Quantity selector */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-[#EAE0D5] rounded-full px-2 py-0.5 bg-white">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="text-[#766E65] hover:text-[#452638] p-1"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold px-2 text-[#452638]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="text-[#766E65] hover:text-[#452638] p-1"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-[#766E65] hover:text-red-700 p-1.5 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Area */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#EAE0D5] bg-white space-y-4">
            {/* Promo Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-lg border border-[#B69A62]/30 text-xs text-[#452638]">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-[#B69A62]" />
                    <span className="font-semibold uppercase tracking-wider">
                      {appliedCoupon.code} applied ({formatINR(discount)} saved)
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-600 hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon code (e.g. AURA10)"
                    className="flex-1 px-3 py-2 bg-white border border-[#EAE0D5] rounded-lg text-xs uppercase focus:outline-none focus:border-[#452638]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#F2E9DF] hover:bg-[#E8C9C5] text-[#452638] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-[#766E65] pt-2 border-t border-[#EAE0D5]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#452638] font-medium">{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount</span>
                  <span>-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? "Free" : formatINR(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#452638] pt-2 border-t border-[#EAE0D5]">
                <span>Total Amount</span>
                <span className="font-serif text-base">{formatINR(finalTotal)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3.5 bg-[#452638] hover:bg-[#5D354D] text-[#FAF7F2] text-xs font-semibold tracking-luxury uppercase rounded-lg flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center space-x-1 text-[11px] text-[#766E65]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B69A62]" />
                <span>100% Secure Checkout with Razorpay / UPI / COD</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
