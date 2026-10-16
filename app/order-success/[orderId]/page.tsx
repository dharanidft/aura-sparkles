"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  Printer, 
  ArrowRight, 
  Sparkles,
  Phone
} from "lucide-react";
import { getOrderById } from "@/lib/orders";
import { Order } from "@/lib/types";
import { formatINR } from "@/lib/shipping";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#452638", "#B69A62", "#E8C9C5", "#FAF7F2"],
      });
    } catch (e) {}

    const found = getOrderById(orderId);
    if (found) {
      setOrder(found);
    }
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-12 md:py-20 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Header */}
        <div className="text-center space-y-4 mb-10">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <p className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">
            Thank You for Illuminating Your Moments
          </p>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#452638] font-normal tracking-tight">
            Order Confirmed!
          </h1>

          <p className="text-sm text-[#766E65] max-w-md mx-auto">
            Order ID: <strong className="text-[#452638] font-mono">{orderId}</strong>
          </p>

          <p className="text-xs text-[#766E65]">
            A confirmation notification has been recorded for your shipment.
          </p>
        </div>

        {/* Tracking Timeline Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE0D5] shadow-card mb-8">
          <h2 className="font-serif text-xl font-medium text-[#452638] mb-6 flex items-center">
            <Package className="w-5 h-5 text-[#B69A62] mr-2" />
            Fulfilment & Delivery Status
          </h2>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#452638] text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="font-semibold text-[#452638]">Order Placed</p>
              <p className="text-[10px] text-[#766E65]">Confirmed</p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#B69A62] text-white flex items-center justify-center mx-auto">
                <Package className="w-4 h-4" />
              </div>
              <p className="font-semibold text-[#452638]">Packaging</p>
              <p className="text-[10px] text-[#766E65]">Hand-poured & Packed</p>
            </div>

            <div className="space-y-2 opacity-50">
              <div className="w-8 h-8 rounded-full bg-[#EAE0D5] text-[#766E65] flex items-center justify-center mx-auto">
                <Truck className="w-4 h-4" />
              </div>
              <p className="font-medium text-[#766E65]">In Transit</p>
              <p className="text-[10px] text-[#766E65]">Express Courier</p>
            </div>

            <div className="space-y-2 opacity-50">
              <div className="w-8 h-8 rounded-full bg-[#EAE0D5] text-[#766E65] flex items-center justify-center mx-auto">
                <MapPin className="w-4 h-4" />
              </div>
              <p className="font-medium text-[#766E65]">Delivered</p>
              <p className="text-[10px] text-[#766E65]">At Your Doorstep</p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#EAE0D5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#766E65] gap-2">
            <span>
              Estimated Delivery:{" "}
              <strong className="text-[#452638]">
                {order?.estimatedDeliveryDate || "Within 3-4 Business Days"}
              </strong>
            </span>
            <span>
              Courier: <strong className="text-[#452638]">BlueDart / Delhivery Express</strong>
            </span>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        {order && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE0D5] shadow-card space-y-6 mb-8">
            <div className="flex items-center justify-between border-b border-[#EAE0D5] pb-4">
              <div>
                <p className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">
                  Invoice Summary
                </p>
                <p className="text-xs text-[#766E65]">
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={handlePrint}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg border border-[#EAE0D5] text-xs font-medium text-[#452638] hover:bg-neutral-50 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-[#B69A62]" />
                <span>Print Invoice</span>
              </button>
            </div>

            {/* Delivery address & payment method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#766E65]">
              <div>
                <p className="font-semibold text-[#452638] uppercase tracking-wider text-[11px] mb-1">
                  Delivery Address
                </p>
                <p className="font-medium text-[#452638]">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.landmark && <p>Near: {order.shippingAddress.landmark}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
                  {order.shippingAddress.pincode}
                </p>
                <p className="mt-1 flex items-center">
                  <Phone className="w-3 h-3 mr-1 text-[#B69A62]" />
                  +91 {order.shippingAddress.phone}
                </p>
              </div>

              <div>
                <p className="font-semibold text-[#452638] uppercase tracking-wider text-[11px] mb-1">
                  Payment Details
                </p>
                <p>
                  Method: <strong className="text-[#452638]">{order.paymentMethod}</strong>
                </p>
                <p>
                  Status:{" "}
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      order.paymentStatus === "Paid"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </p>
                {order.razorpayPaymentId && (
                  <p className="font-mono text-[10px] mt-1">Ref: {order.razorpayPaymentId}</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="pt-4 border-t border-[#EAE0D5] space-y-3">
              <p className="font-semibold text-[#452638] uppercase tracking-wider text-[11px]">
                Items in Package
              </p>
              {order.items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between text-xs py-2 border-b border-[#EAE0D5]/40">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-white border border-[#EAE0D5] flex-shrink-0 p-0.5">
                      <Image
                        src={item.product.images[0] || "/images/logo.png"}
                        alt={item.product.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-[#452638]">{item.product.name}</p>
                      <p className="text-[11px] text-[#766E65]">
                        Qty: {item.quantity} · {formatINR(item.product.price)} each
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-[#452638]">
                    {formatINR(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-[#EAE0D5] space-y-1.5 text-xs text-[#766E65]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({order.discountCode})</span>
                  <span>-{formatINR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{order.shippingFee === 0 ? "Free" : formatINR(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#452638] pt-2 border-t border-[#EAE0D5]">
                <span>Total Paid</span>
                <span className="font-serif text-lg">{formatINR(order.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center space-y-3">
          <Link
            href="/shop"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-[#452638] hover:bg-[#5D354D] text-[#FAF7F2] text-xs font-semibold tracking-luxury uppercase rounded-full shadow-md transition-all"
          >
            <span>DISCOVER MORE FRAGRANCES</span>
            <ArrowRight className="w-4 h-4 text-[#B69A62]" />
          </Link>

          <div>
            <Link
              href="/"
              className="text-xs text-[#766E65] hover:text-[#452638] underline"
            >
              Return to Homepage
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
