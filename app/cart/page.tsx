"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, Tag, ShieldCheck, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/shipping";

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
    <div className="py-12 md:py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link
          href="/shop"
          className="inline-flex items-center space-x-1.5 text-xs text-[#766E65] hover:text-[#452638] mb-6 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>

        <h1 className="font-serif text-3xl sm:text-4xl text-[#452638] font-normal tracking-tight mb-8">
          Shopping Bag ({totalItemsCount} {totalItemsCount === 1 ? "item" : "items"})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Items */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Free shipping progress */}
            <div className="p-4 bg-white rounded-xl border border-[#EAE0D5] shadow-subtle">
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

            {/* List */}
            <div className="bg-white rounded-2xl border border-[#EAE0D5] shadow-subtle divide-y divide-[#EAE0D5]">
              {items.map((item) => (
                <div key={item.product.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-[#EAE0D5] flex-shrink-0 p-1">
                      <Image
                        src={item.product.images[0] || "/images/logo.png"}
                        alt={item.product.name}
                        fill
                        className="object-contain p-0.5"
                      />
                    </div>
                    <div>
                      <Link href={`/shop/${item.product.slug}`}>
                        <h3 className="font-serif text-lg font-medium text-[#452638] hover:text-[#B69A62]">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-[#766E65]">
                        {item.product.netWeight} · {item.product.fragranceFamily}
                      </p>
                      <p className="text-sm font-semibold text-[#452638] mt-1">
                        {formatINR(item.product.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
                    <div className="flex items-center border border-[#EAE0D5] rounded-full px-2.5 py-1 bg-white">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="text-[#766E65] hover:text-[#452638] p-1"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-semibold px-3 text-[#452638]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="text-[#766E65] hover:text-[#452638] p-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-serif text-base font-semibold text-[#452638] min-w-16 text-right">
                      {formatINR(item.product.price * item.quantity)}
                    </span>

                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-[#766E65] hover:text-red-700 p-2"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Order summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#EAE0D5] shadow-subtle space-y-5">
              <h2 className="font-serif text-xl font-medium text-[#452638] border-b border-[#EAE0D5] pb-3">
                Order Summary
              </h2>

              {/* Coupon */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-[#F2E9DF] rounded-xl text-xs text-[#452638]">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-[#B69A62]" />
                      <span className="font-semibold uppercase">{appliedCoupon.code} applied</span>
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
                      className="flex-1 px-3 py-2 bg-white border border-[#EAE0D5] rounded-xl text-xs uppercase focus:outline-none focus:border-[#452638]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#F2E9DF] hover:bg-[#E8C9C5] text-[#452638] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
              </div>

              {/* Numbers */}
              <div className="space-y-2 text-xs text-[#766E65] pt-2 border-t border-[#EAE0D5]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#452638] font-medium">{formatINR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span>-{formatINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span>{shippingFee === 0 ? "Free" : formatINR(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-[#452638] pt-2 border-t border-[#EAE0D5]">
                  <span>Total Amount</span>
                  <span className="font-serif text-xl">{formatINR(finalTotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 bg-[#452638] hover:bg-[#5D354D] text-[#FAF7F2] text-xs font-semibold tracking-luxury uppercase rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4 text-[#B69A62]" />
              </Link>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-[#766E65]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B69A62]" />
                <span>Secure Payments via Razorpay & UPI</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
