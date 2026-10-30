"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, Tag, ShieldCheck, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatINR, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
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

  useEffect(() => {
    document.title = "Shopping Bag — Aura Sparkles";
  }, []);

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
  const progressPercent = Math.min(100, Math.round((netSubtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - netSubtotal);

  if (items.length === 0) {
    return (
      <div className="py-20 md:py-28 bg-white min-h-screen text-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-2xl border border-[#EAE0D5] space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-white border border-[#EAE0D5] shadow-xs flex items-center justify-center mx-auto text-[#B69A62]">
            <ShoppingBag className="w-8 h-8 opacity-60" />
          </div>
          <h1 className="font-serif text-3xl text-[#452638]">Your Bag is Empty</h1>
          <p className="text-xs text-[#766E65]">
            Looks like you haven't added any handcrafted soy wax candles or home fragrances yet.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3.5 bg-[#452638] text-white text-xs uppercase tracking-luxury rounded-full hover:bg-[#5D354D] transition-colors"
          >
            Explore Scented Candles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/shop"
              className="inline-flex items-center text-xs uppercase tracking-luxury text-[#766E65] hover:text-[#452638] mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Continue Shopping
            </Link>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#452638]">
              Shopping Bag ({totalItemsCount})
            </h1>
          </div>
        </div>

        {/* Free shipping progress */}
        <div className="bg-white p-4 rounded-xl border border-[#EAE0D5] mb-8 shadow-xs">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#452638] font-medium flex items-center">
              <Sparkles className="w-4 h-4 text-[#B69A62] mr-1.5" />
              {amountNeeded > 0
                ? `Add ${formatINR(amountNeeded)} more to unlock FREE Delivery across India!`
                : "🎉 You unlocked FREE Delivery across India!"}
            </span>
            <span className="text-xs font-bold text-[#B69A62]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#EAE0D5] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#452638] h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-[#EAE0D5] overflow-hidden shadow-card">
              <div className="p-4 bg-slate-50 border-b border-[#EAE0D5] text-xs font-semibold text-[#452638] uppercase tracking-wider hidden sm:grid sm:grid-cols-12 gap-4">
                <span className="col-span-6">Product</span>
                <span className="col-span-2 text-center">Price</span>
                <span className="col-span-2 text-center">Quantity</span>
                <span className="col-span-2 text-right">Total</span>
              </div>

              <div className="divide-y divide-[#EAE0D5]">
                {items.map((item) => (
                  <div key={item.product.id} className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    {/* Info */}
                    <div className="sm:col-span-6 flex items-center space-x-4">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-[#EAE0D5] flex-shrink-0 p-1">
                        <Image
                          src={item.product.images[0] || "/images/logo.png"}
                          alt={item.product.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <h2 className="font-serif text-base font-medium text-[#452638]">
                          {item.product.name}
                        </h2>
                        <p className="text-xs text-[#766E65]">
                          {item.product.netWeight} · {item.product.fragranceFamily}
                        </p>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-[11px] text-red-600 hover:underline mt-2 flex items-center"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="sm:col-span-2 text-left sm:text-center text-xs sm:text-sm font-semibold text-[#452638]">
                      {formatINR(item.product.price)}
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-2 flex items-center sm:justify-center">
                      <div className="flex items-center border border-[#EAE0D5] rounded-full px-2 py-0.5 bg-white">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-[#766E65] hover:text-[#452638]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-[#452638]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-[#766E65] hover:text-[#452638]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Row Total */}
                    <div className="sm:col-span-2 text-right font-serif text-base font-semibold text-[#452638]">
                      {formatINR(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#EAE0D5] shadow-card space-y-4">
              <h2 className="font-serif text-xl font-medium text-[#452638] border-b border-[#EAE0D5] pb-3">
                Order Summary
              </h2>

              {/* Coupon input */}
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
                      placeholder="Coupon Code"
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

              {/* Breakdown */}
              <div className="space-y-2 text-xs text-[#766E65] pt-2 border-t border-[#EAE0D5]">
                <div className="flex justify-between">
                  <span>Merchandise Subtotal</span>
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
                <div className="flex justify-between text-base font-semibold text-[#452638] pt-3 border-t border-[#EAE0D5]">
                  <span>Total Amount</span>
                  <span className="font-serif text-xl">{formatINR(finalTotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 bg-[#452638] hover:bg-[#5D354D] text-[#FAF7F2] text-xs font-semibold tracking-luxury uppercase rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg mt-4"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center space-x-1 text-[11px] text-[#766E65] pt-2">
                <ShieldCheck className="w-4 h-4 text-[#B69A62]" />
                <span>Safe &amp; Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
