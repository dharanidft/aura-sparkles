"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Truck, 
  Search, 
  Package, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Phone, 
  Mail, 
  AlertCircle 
} from "lucide-react";
import { getAllOrders, getOrderById } from "@/lib/orders";
import { Order } from "@/lib/types";
import { formatINR } from "@/lib/shipping";

export default function TrackOrderPage() {
  const [query, setQuery] = useState("");
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    document.title = "Track Your Order — Aura Sparkles";
    const orders = getAllOrders();
    setRecentOrders(orders);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    setSearched(true);
    // 1. Direct order ID match
    const byId = getOrderById(clean);
    if (byId) {
      setMatchedOrder(byId);
      return;
    }

    // 2. Lookup by phone number in stored orders
    const cleanPhone = clean.replace(/\D/g, "");
    if (cleanPhone.length >= 10) {
      const byPhone = recentOrders.find(
        (o) => o.shippingAddress.phone.replace(/\D/g, "") === cleanPhone
      );
      if (byPhone) {
        setMatchedOrder(byPhone);
        return;
      }
    }

    setMatchedOrder(null);
  };

  return (
    <div className="py-16 md:py-24 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">
            <Truck className="w-4 h-4" />
            <span>Order Tracking &amp; Fulfilment</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#452638]">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-[#766E65]">
            Enter your Aura Sparkles Order ID (e.g. AS-XXXX-XXXX) or 10-digit mobile number to view live shipment status.
          </p>
        </div>

        {/* Search Bar Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE0D5] shadow-card">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#766E65] absolute left-4 top-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. AS-1234-5678) or Mobile Number"
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#EAE0D5] rounded-xl text-xs sm:text-sm text-[#282522] focus:outline-none focus:border-[#452638]"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-[#452638] hover:bg-[#5D354D] text-white text-xs font-semibold uppercase tracking-luxury rounded-xl transition-colors shadow-sm"
            >
              Track Order
            </button>
          </form>

          {searched && !matchedOrder && (
            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="flex items-center space-x-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>No matching order found in this browser's recent purchases.</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                If you placed this order from a different device or private browser window, please verify the exact Order ID printed in your order confirmation, or contact our customer team directly on WhatsApp (+91 93853 28336) with your details.
              </p>
            </div>
          )}
        </div>

        {/* Display Matched Order Status */}
        {matchedOrder && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE0D5] shadow-card space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EAE0D5] pb-4 gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-luxury text-[#B69A62] font-semibold">
                  Fulfilment Status
                </p>
                <h2 className="font-serif text-2xl text-[#452638]">
                  Order #{matchedOrder.id}
                </h2>
                <p className="text-xs text-[#766E65]">
                  Placed on {new Date(matchedOrder.createdAt).toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Link
                href={`/order-success/${matchedOrder.id}`}
                className="inline-flex items-center text-xs font-semibold text-[#452638] hover:text-[#B69A62] underline"
              >
                View Full Invoice &amp; Details
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs pt-2">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#452638] text-white flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="font-semibold text-[#452638]">Order Placed</p>
                <p className="text-[10px] text-emerald-700 font-medium">Confirmed</p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#B69A62] text-white flex items-center justify-center mx-auto shadow-xs">
                  <Package className="w-4 h-4" />
                </div>
                <p className="font-semibold text-[#452638]">Packaging</p>
                <p className="text-[10px] text-[#766E65]">Hand-poured Soy</p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#EAE0D5] text-[#766E65] flex items-center justify-center mx-auto">
                  <Truck className="w-4 h-4" />
                </div>
                <p className="font-medium text-[#766E65]">In Transit</p>
                <p className="text-[10px] text-[#766E65]">Express Courier</p>
              </div>

              <div className="space-y-2 opacity-60">
                <div className="w-8 h-8 rounded-full bg-[#EAE0D5] text-[#766E65] flex items-center justify-center mx-auto">
                  <MapPin className="w-4 h-4" />
                </div>
                <p className="font-medium text-[#766E65]">Delivery</p>
                <p className="text-[10px] text-[#766E65]">To Your Doorstep</p>
              </div>
            </div>

            {/* Shipping details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#EAE0D5] text-xs text-[#766E65]">
              <div>
                <p className="font-semibold text-[#452638] uppercase tracking-wider text-[11px] mb-1">
                  Recipient &amp; Destination
                </p>
                <p className="font-medium text-[#452638]">{matchedOrder.shippingAddress.fullName}</p>
                <p>{matchedOrder.shippingAddress.addressLine1}</p>
                <p>
                  {matchedOrder.shippingAddress.city}, {matchedOrder.shippingAddress.state} — {matchedOrder.shippingAddress.pincode}
                </p>
              </div>

              <div>
                <p className="font-semibold text-[#452638] uppercase tracking-wider text-[11px] mb-1">
                  Courier Tracking
                </p>
                <p>Partner: <strong className="text-[#452638]">BlueDart Express / Delhivery</strong></p>
                <p>Tracking AWB: <strong className="text-[#452638] font-mono">{matchedOrder.trackingNumber || `EXP-${matchedOrder.id}`}</strong></p>
                <p>
                  Estimated Delivery: <strong className="text-emerald-700">{matchedOrder.estimatedDeliveryDate || "3-4 Business Days"}</strong>
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="pt-4 border-t border-[#EAE0D5] space-y-2">
              <p className="font-semibold text-[#452638] uppercase tracking-wider text-[11px]">
                Items in Package
              </p>
              {matchedOrder.items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between text-xs py-1.5 border-b border-[#EAE0D5]/50">
                  <span className="text-[#452638] font-medium">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span>{formatINR(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders Stored on this device */}
        {!matchedOrder && recentOrders.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl text-[#452638]">
              Your Recent Orders on this Device
            </h2>
            <div className="space-y-3">
              {recentOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => {
                    setMatchedOrder(ord);
                    setSearched(true);
                  }}
                  className="p-4 bg-white rounded-xl border border-[#EAE0D5] hover:border-[#452638] cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
                >
                  <div>
                    <span className="text-xs font-bold text-[#452638] font-mono">
                      #{ord.id}
                    </span>
                    <p className="text-xs text-[#766E65]">
                      {ord.items.map((i) => i.product.name).join(", ")}
                    </p>
                    <p className="text-[11px] text-[#766E65]">
                      Placed {new Date(ord.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })} · {formatINR(ord.total)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
                      {ord.orderStatus || "Confirmed"}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#B69A62]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Help Footer */}
        <div className="p-6 bg-[#FAF7F2] rounded-2xl border border-[#EAE0D5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#766E65]">
          <div>
            <p className="font-semibold text-[#452638]">Have questions regarding your shipment?</p>
            <p>Our concierge team is available Monday to Saturday, 10 AM to 7 PM IST.</p>
          </div>
          <div className="flex items-center space-x-4 flex-shrink-0">
            <a
              href="https://wa.me/919385328336?text=Hi%20Aura%20Sparkles,%20I%20would%20like%20to%20check%20the%20status%20of%20my%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-[#452638] font-semibold hover:underline"
            >
              <Phone className="w-3.5 h-3.5 text-[#B69A62]" />
              <span>WhatsApp Support</span>
            </a>
            <span>•</span>
            <a
              href="mailto:contact@aurasparkles.com"
              className="inline-flex items-center space-x-1.5 text-[#452638] font-semibold hover:underline"
            >
              <Mail className="w-3.5 h-3.5 text-[#B69A62]" />
              <span>contact@aurasparkles.com</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
