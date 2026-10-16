"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Banknote, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Tag
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatINR, checkIndianPincode } from "@/lib/shipping";
import { ShippingAddress, Order } from "@/lib/types";
import { saveOrderToStorage } from "@/lib/orders";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi NCR", "Chandigarh"
];

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    discount,
    shippingFee,
    finalTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Delhi NCR");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Razorpay" | "COD">("Razorpay");
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-fill city/state when entering 6-digit PIN code
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(val);
    if (val.length === 6) {
      const res = checkIndianPincode(val);
      if (res.city && res.city !== "Your City") setCity(res.city);
      if (res.state && res.state !== "India") setState(res.state);
    }
  };

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

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim().replace(/\D/g, ""))) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    // Pincode validation
    if (pincode.trim().length !== 6) {
      setErrorMessage("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    setIsProcessing(true);

    const shippingAddress: ShippingAddress = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
    };

    try {
      // 1. Create order on server
      const createRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          couponCode: appliedCoupon?.code,
          shippingAddress,
          paymentMethod,
        }),
      });

      const orderData = await createRes.json();

      if (!createRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to create order.");
      }

      // 2. Process Payment
      if (paymentMethod === "COD") {
        // Cash on delivery flow
        const completeOrder: Order = {
          id: orderData.orderId,
          createdAt: new Date().toISOString(),
          items: [...items],
          subtotal,
          discount,
          discountCode: appliedCoupon?.code,
          shippingFee,
          total: finalTotal,
          shippingAddress,
          paymentMethod: "COD",
          paymentStatus: "COD",
          orderStatus: "Confirmed",
          trackingNumber: `EXP-IN-${Date.now().toString().slice(-6)}`,
          estimatedDeliveryDate: checkIndianPincode(pincode).deliveryDateStr,
        };

        saveOrderToStorage(completeOrder);
        clearCart();
        router.push(`/order-success/${completeOrder.id}`);
        return;
      }

      // Online payment (Razorpay / Test Gateway flow)
      const verifyRes = await fetch("/api/checkout/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderData.razorpayOrderId,
          razorpay_payment_id: `pay_${Date.now().toString().slice(-8)}`,
          isTestMode: !orderData.isLiveGateway,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.verified) {
        throw new Error(verifyData.error || "Payment verification failed.");
      }

      const completeOrder: Order = {
        id: orderData.orderId,
        createdAt: new Date().toISOString(),
        items: [...items],
        subtotal,
        discount,
        discountCode: appliedCoupon?.code,
        shippingFee,
        total: finalTotal,
        shippingAddress,
        paymentMethod: "Razorpay",
        paymentStatus: "Paid",
        orderStatus: "Confirmed",
        razorpayPaymentId: verifyData.paymentId,
        razorpayOrderId: orderData.razorpayOrderId,
        trackingNumber: `EXP-IN-${Date.now().toString().slice(-6)}`,
        estimatedDeliveryDate: checkIndianPincode(pincode).deliveryDateStr,
      };

      saveOrderToStorage(completeOrder);
      clearCart();
      router.push(`/order-success/${completeOrder.id}`);
    } catch (err: any) {
      console.error("Checkout process error", err);
      setErrorMessage(err.message || "An unexpected error occurred during checkout.");
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center bg-white min-h-screen">
        <div className="max-w-md mx-auto p-8 bg-white rounded-2xl border border-[#EAE0D5] space-y-4 shadow-sm">
          <p className="font-serif text-2xl text-[#452638]">Your shopping bag is empty</p>
          <p className="text-xs text-[#766E65]">Please add items to your cart before proceeding to checkout.</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 bg-[#452638] text-white text-xs uppercase tracking-luxury rounded-full hover:bg-[#5D354D]"
          >
            Explore Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 md:py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/shop"
          className="inline-flex items-center space-x-1.5 text-xs text-[#766E65] hover:text-[#452638] mb-8 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>

        <h1 className="font-serif text-3xl sm:text-4xl text-[#452638] font-normal tracking-tight mb-8">
          Checkout & Delivery
        </h1>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left 7 Cols: Address & Payment Methods */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Delivery Address */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE0D5] shadow-subtle space-y-5">
                <div className="flex items-center space-x-2 border-b border-[#EAE0D5] pb-3">
                  <Truck className="w-5 h-5 text-[#B69A62]" />
                  <h2 className="font-serif text-xl font-medium text-[#452638]">
                    1. Shipping Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#452638] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Radhika Verma"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#452638] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. radhika@example.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#452638] mb-1">
                      Mobile Number (+91) *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#452638] mb-1">
                      House / Flat / Block No. & Street *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="e.g. Flat 402, Golden Palms Residency"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#452638] mb-1">
                      Area / Locality / Landmark
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near Rose Garden"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#452638] mb-1">
                      6-Digit PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={handlePincodeChange}
                      placeholder="e.g. 560001"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#452638] mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#452638] mb-1">
                      State *
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE0D5] shadow-subtle space-y-5">
                <div className="flex items-center space-x-2 border-b border-[#EAE0D5] pb-3">
                  <CreditCard className="w-5 h-5 text-[#B69A62]" />
                  <h2 className="font-serif text-xl font-medium text-[#452638]">
                    2. Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* Razorpay Option */}
                  <label
                    className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "Razorpay"
                        ? "border-[#452638] bg-[#F2E9DF]/30"
                        : "border-[#EAE0D5] hover:border-[#B69A62]"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "Razorpay"}
                        onChange={() => setPaymentMethod("Razorpay")}
                        className="mt-1 text-[#452638] focus:ring-[#452638]"
                      />
                      <div>
                        <p className="text-xs font-semibold text-[#452638]">
                          Online Payment (UPI, Cards, NetBanking, Wallets)
                        </p>
                        <p className="text-[11px] text-[#766E65] mt-0.5">
                          Instant verification via Razorpay Gateway. 100% secure encrypted transaction.
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1.5 flex-shrink-0">
                      <span className="px-2 py-0.5 bg-white rounded border text-[9px] font-bold text-[#452638]">
                        UPI
                      </span>
                      <span className="px-2 py-0.5 bg-white rounded border text-[9px] font-bold text-[#452638]">
                        Cards
                      </span>
                    </div>
                  </label>

                  {/* Cash on Delivery Option */}
                  <label
                    className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "COD"
                        ? "border-[#452638] bg-[#F2E9DF]/30"
                        : "border-[#EAE0D5] hover:border-[#B69A62]"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="mt-1 text-[#452638] focus:ring-[#452638]"
                      />
                      <div>
                        <p className="text-xs font-semibold text-[#452638]">
                          Cash on Delivery (COD)
                        </p>
                        <p className="text-[11px] text-[#766E65] mt-0.5">
                          Pay cash to the delivery courier upon arrival at your doorstep.
                        </p>
                      </div>
                    </div>
                    <Banknote className="w-5 h-5 text-[#B69A62] flex-shrink-0" />
                  </label>
                </div>

                {/* Gateway architecture note */}
                <div className="p-3 bg-white rounded-xl border border-[#EAE0D5] flex items-center space-x-2 text-[11px] text-[#766E65]">
                  <ShieldCheck className="w-4 h-4 text-[#B69A62] flex-shrink-0" />
                  <span>
                    AURA SPARKLES never stores credit card details. Payment status is confirmed before fulfillment.
                  </span>
                </div>
              </div>

            </div>

            {/* Right 5 Cols: Order Summary & Review */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE0D5] shadow-subtle space-y-5">
                <h2 className="font-serif text-xl font-medium text-[#452638] border-b border-[#EAE0D5] pb-3">
                  Order Summary ({items.reduce((a, b) => a + b.quantity, 0)} items)
                </h2>

                {/* Item List */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center space-x-3 text-xs">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-[#EAE0D5] p-1">
                        <Image
                          src={item.product.images[0] || "/images/logo.png"}
                          alt={item.product.name}
                          fill
                          className="object-contain p-0.5"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-medium text-[#452638] truncate text-sm">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-[#766E65]">
                          Qty: {item.quantity} · {item.product.netWeight.split("/")[0]}
                        </p>
                      </div>
                      <span className="font-semibold text-[#452638]">
                        {formatINR(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <div className="pt-3 border-t border-[#EAE0D5]">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-[#F2E9DF] rounded-lg text-xs text-[#452638]">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-3.5 h-3.5 text-[#B69A62]" />
                        <span className="font-semibold uppercase">{appliedCoupon.code}</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Coupon code (e.g. AURA10)"
                        className="flex-1 px-3 py-2 bg-white border border-[#EAE0D5] rounded-lg text-xs uppercase focus:outline-none focus:border-[#452638]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-[#F2E9DF] hover:bg-[#E8C9C5] text-[#452638] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
                </div>

                {/* Amount breakdown */}
                <div className="space-y-2 text-xs text-[#766E65] pt-3 border-t border-[#EAE0D5]">
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
                    <span>Total Payable</span>
                    <span className="font-serif text-xl">{formatINR(finalTotal)}</span>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Order CTA */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#452638] hover:bg-[#5D354D] text-[#FAF7F2] text-xs font-semibold tracking-luxury uppercase rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-[#B69A62]" />
                  <span>
                    {isProcessing
                      ? "Processing Secure Order..."
                      : `CONFIRM ORDER (${formatINR(finalTotal)})`}
                  </span>
                </button>

                <p className="text-center text-[10px] text-[#766E65]">
                  By confirming, you agree to AURA SPARKLES terms of service & privacy policy.
                </p>
              </div>

            </div>

          </div>
        </form>

      </div>
    </div>
  );
}
