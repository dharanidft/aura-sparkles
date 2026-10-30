"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Instagram, ShieldCheck, Truck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#EAE0D5] text-[#282522]">
      {/* Upper Brand Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Brand Info & Direct Contact */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white shadow-xs border border-[#B69A62]/30 p-0.5">
                <Image
                  src="/images/logo.png"
                  alt="Aura Sparkles"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl tracking-[0.18em] font-medium text-[#452638] uppercase">
                  AURA
                </span>
                <span className="text-[10px] tracking-[0.25em] text-[#B69A62] font-semibold uppercase -mt-1">
                  SPARKLES
                </span>
              </div>
            </Link>

            <p className="font-serif italic text-base text-[#452638]">
              &ldquo;Pure · Elegant · You&rdquo;
            </p>

            <p className="text-xs text-[#766E65] leading-relaxed max-w-sm font-sans">
              Indian home-fragrance studio dedicated to affordable luxury. Hand-poured 100% natural soy wax candles, hanging botanical wax sachets, ceramic casting decor, and kids creative activity kits.
            </p>

            {/* Direct Verified Contact Links */}
            <div className="space-y-2 text-xs text-[#766E65] pt-1">
              <div className="flex items-center space-x-3">
                <a
                  href="tel:+919385328336"
                  className="flex items-center space-x-1.5 hover:text-[#452638] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#B69A62]" />
                  <span>+91 93853 28336</span>
                </a>
                <span>•</span>
                <a
                  href="mailto:contact@aurasparkles.com"
                  className="flex items-center space-x-1.5 hover:text-[#452638] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#B69A62]" />
                  <span>contact@aurasparkles.com</span>
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <a
                  href="https://www.instagram.com/aurasparklesofficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 hover:text-[#452638] transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#B69A62]" />
                  <span>@aurasparklesofficial</span>
                </a>
                <span>•</span>
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#B69A62]" />
                  <span>Ayanambakkam, Tamil Nadu</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Shop Links */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-luxury text-[#452638]">
              Shop
            </p>
            <ul className="space-y-2 text-xs text-[#766E65]">
              <li>
                <Link href="/shop" className="hover:text-[#452638] transition-colors">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Scented+Candles" className="hover:text-[#452638] transition-colors">
                  Candles (From ₹160)
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Wax+Sachets" className="hover:text-[#452638] transition-colors">
                  Wax Sachets (From ₹249)
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Casting+Decor" className="hover:text-[#452638] transition-colors">
                  Casting Decor (From ₹199)
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Pop+Art+Kits" className="hover:text-[#452638] transition-colors">
                  Pop Art Kits for Kids (From ₹299)
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Combo+Offers" className="hover:text-[#452638] transition-colors">
                  Combo Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: The Brand & Customer Services */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-luxury text-[#452638]">
              About Aura
            </p>
            <ul className="space-y-2 text-xs text-[#766E65]">
              <li>
                <Link href="/story" className="hover:text-[#452638] transition-colors">
                  Our Story &amp; Philosophy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#452638] transition-colors">
                  Candle Care &amp; Safety Guide
                </Link>
              </li>
              <li>
                <Link href="/corporate-gifting" className="hover:text-[#452638] transition-colors">
                  Corporate Gifting &amp; Wholesale
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-[#452638] transition-colors font-medium text-[#452638] flex items-center">
                  <Truck className="w-3.5 h-3.5 mr-1 text-[#B69A62]" />
                  <span>Track Your Order</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Help & Policies */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-luxury text-[#452638]">
              Help &amp; Policies
            </p>
            <ul className="space-y-2 text-xs text-[#766E65]">
              <li>
                <Link href="/contact" className="hover:text-[#452638] transition-colors">
                  Contact Customer Care
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#452638] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-[#452638] transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-[#452638] transition-colors">
                  Returns &amp; Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#452638] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#452638] transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Payment Methods & Bottom Bar */}
      <div className="border-t border-[#EAE0D5] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#766E65]">
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#452638] mr-2">
              Payment Partners:
            </span>
            <span className="px-2.5 py-1 bg-white rounded border border-[#EAE0D5] text-[10px] font-semibold text-[#452638]">
              UPI
            </span>
            <span className="px-2.5 py-1 bg-white rounded border border-[#EAE0D5] text-[10px] font-semibold text-[#452638]">
              Razorpay
            </span>
            <span className="px-2.5 py-1 bg-white rounded border border-[#EAE0D5] text-[10px] font-semibold text-[#452638]">
              Visa
            </span>
            <span className="px-2.5 py-1 bg-white rounded border border-[#EAE0D5] text-[10px] font-semibold text-[#452638]">
              Mastercard
            </span>
            <span className="px-2.5 py-1 bg-white rounded border border-[#EAE0D5] text-[10px] font-semibold text-[#452638]">
              RuPay
            </span>
            <span className="px-2.5 py-1 bg-white rounded border border-[#EAE0D5] text-[10px] font-semibold text-[#452638]">
              Cash on Delivery (COD)
            </span>
          </div>

          <div className="text-center md:text-right text-[11px]">
            <p>© {new Date().getFullYear()} Aura Sparkles. All rights reserved.</p>
            <p className="text-[10px] text-[#766E65]/80 mt-0.5">
              Official Merchant of Record: Aura Sparkles (Chennai, India) · Direct UPI via HDFC Bank &amp; Razorpay
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
