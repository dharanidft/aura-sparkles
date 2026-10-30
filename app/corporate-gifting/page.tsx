"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Building2, 
  Gift, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  Phone, 
  Mail, 
  MessageCircle, 
  Download, 
  ShieldCheck, 
  Truck, 
  Hotel, 
  HeartHandshake,
  Award
} from "lucide-react";

export default function CorporateGiftingPage() {
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    giftingType: "Corporate Gifting",
    quantity: "50-100 units",
    targetDate: "",
    city: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Send to contact API
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: `[B2B / Corporate Enquiry] ${formData.giftingType} - ${formData.companyName || formData.name}`,
          message: `Gifting Type: ${formData.giftingType}\nCompany/Event: ${formData.companyName}\nEstimated Quantity: ${formData.quantity}\nTarget Delivery Date: ${formData.targetDate || "Not specified"}\nDestination City: ${formData.city || "Not specified"}\n\nClient Requirements:\n${formData.message}`,
        }),
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Enquiry submission error:", err);
      setSubmitted(true); // Still show success with WhatsApp fallback
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsAppEnquiry = () => {
    const text = encodeURIComponent(
      `Hello Aura Sparkles Team! I am interested in bulk / corporate gifting.\n\nName: ${formData.name || "Client"}\nCompany/Event: ${formData.companyName || "N/A"}\nType: ${formData.giftingType}\nEst. Quantity: ${formData.quantity}\nCity: ${formData.city || "India"}`
    );
    window.open(`https://wa.me/919385328336?text=${text}`, "_blank");
  };

  return (
    <div className="bg-white min-h-screen text-[#282522]">
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative bg-[#FBF8F3] py-16 md:py-24 border-b border-[#EAE0D5] overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B69A62_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center space-x-2 text-xs uppercase tracking-luxury text-[#B69A62] font-semibold bg-white px-3.5 py-1.5 rounded-full border border-[#EAE0D5] shadow-xs mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>B2B, Wholesale &amp; Bespoke Gifting</span>
            </span>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#452638] font-normal tracking-tight leading-tight">
              Curated Fragrance Gifts for Memorable Occasions
            </h1>

            <p className="mt-4 text-sm sm:text-base text-[#766E65] leading-relaxed">
              Elevate your corporate gifting, wedding return favors, and boutique hotel amenities with hand-poured 100% soy wax candles, botanical wax sachets, and artisanal ceramic casting decor. Custom packaging, gold foil logo sleeves, and GST invoicing provided.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <a
                href="#enquiry-form"
                className="px-8 py-3.5 bg-[#452638] hover:bg-[#5D354D] text-[#FAF7F2] text-xs font-semibold uppercase tracking-luxury rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Request Custom Quote
              </a>
              <button
                onClick={openWhatsAppEnquiry}
                className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-luxury rounded-full shadow-xs flex items-center space-x-2 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pillars of Aura Gifting ───────────────────────────────────────── */}
      <section className="py-16 md:py-20 border-b border-[#EAE0D5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">
              Tailored Solutions
            </p>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#452638] mt-1 font-normal">
              Designed For Every Special Gathering
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#FBF8F3] border border-[#EAE0D5] hover:border-[#B69A62]/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#EAE0D5] flex items-center justify-center text-[#452638]">
                <Building2 className="w-6 h-6 text-[#B69A62]" />
              </div>
              <h3 className="font-serif text-lg font-medium text-[#452638]">Corporate &amp; Executive</h3>
              <p className="text-xs text-[#766E65] leading-relaxed">
                Client appreciation hampers, annual employee recognitions, festival Diwali gifts, and conference welcoming packages with bespoke branding.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FBF8F3] border border-[#EAE0D5] hover:border-[#B69A62]/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#EAE0D5] flex items-center justify-center text-[#452638]">
                <HeartHandshake className="w-6 h-6 text-[#B69A62]" />
              </div>
              <h3 className="font-serif text-lg font-medium text-[#452638]">Wedding &amp; Celebrations</h3>
              <p className="text-xs text-[#766E65] leading-relaxed">
                Meaningful wedding return favors, mehendi hampers, housewarming gifts, and anniversary celebrations with personalized calligraphy cards.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FBF8F3] border border-[#EAE0D5] hover:border-[#B69A62]/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#EAE0D5] flex items-center justify-center text-[#452638]">
                <Hotel className="w-6 h-6 text-[#B69A62]" />
              </div>
              <h3 className="font-serif text-lg font-medium text-[#452638]">Hospitality &amp; Boutique Stays</h3>
              <p className="text-xs text-[#766E65] leading-relaxed">
                Turn-down scented gifts, custom hotel lobby aroma signature blends, and wardrobe botanical wax tablets for luxury guest suites.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FBF8F3] border border-[#EAE0D5] hover:border-[#B69A62]/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#EAE0D5] flex items-center justify-center text-[#452638]">
                <Gift className="w-6 h-6 text-[#B69A62]" />
              </div>
              <h3 className="font-serif text-lg font-medium text-[#452638]">Wholesale &amp; Retail</h3>
              <p className="text-xs text-[#766E65] leading-relaxed">
                Tiered wholesale pricing for premium lifestyle boutiques, home decor concept stores, and spa salons looking to carry Aura Sparkles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Wholesale Tiered Benefits ──────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-[#FBF8F3] border-b border-[#EAE0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">
              Volume Pricing Tiers
            </p>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#452638] mt-1 font-normal">
              Transparent Wholesale Discounts
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-white border border-[#EAE0D5] space-y-4 shadow-sm relative">
              <span className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">Tier 1 · Starter Bulk</span>
              <h3 className="font-serif text-2xl text-[#452638]">25 – 49 Units</h3>
              <p className="text-xs text-[#766E65] leading-relaxed">
                Perfect for boutique gatherings, team milestones, and intimate wedding celebrations.
              </p>
              <ul className="space-y-2 text-xs text-[#282522] pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>15% Wholesale Discount</strong> on catalog price</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Complimentary customized gift tags</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Assorted or single fragrance selection</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-white border-2 border-[#452638] space-y-4 shadow-md relative">
              <span className="absolute -top-3 left-8 bg-[#452638] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Most Popular
              </span>
              <span className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">Tier 2 · Corporate Hampers</span>
              <h3 className="font-serif text-2xl text-[#452638]">50 – 199 Units</h3>
              <p className="text-xs text-[#766E65] leading-relaxed">
                Ideal for festive corporate gifts, annual client appreciation, and medium events.
              </p>
              <ul className="space-y-2 text-xs text-[#282522] pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>25% Wholesale Discount</strong> on catalog price</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Custom company logo foil band &amp; message card</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Dedicated B2B account manager &amp; sample review</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Priority production timeline</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#EAE0D5] space-y-4 shadow-sm relative">
              <span className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">Tier 3 · Enterprise &amp; Hospitality</span>
              <h3 className="font-serif text-2xl text-[#452638]">200+ Units</h3>
              <p className="text-xs text-[#766E65] leading-relaxed">
                For grand corporate orders, hotel amenities, and large-scale festive distributions.
              </p>
              <ul className="space-y-2 text-xs text-[#282522] pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>35%+ Bespoke Bulk Pricing</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Fully custom packaging &amp; ribbon selection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Option for proprietary custom fragrance formulation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Multi-location direct courier dispatch across India</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Enquiry Form ─────────────────────────────────────── */}
      <section id="enquiry-form" className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#FBF8F3] border border-[#EAE0D5] shadow-sm">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">
                Start Your Partnership
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#452638] mt-1 font-normal">
                Request a Custom Quote or Sample
              </h2>
              <p className="text-xs text-[#766E65] mt-2">
                Fill out the details below and our studio team in Chennai will prepare a personalized proposal and quotation within 24 hours.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-white border border-[#EAE0D5] text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-2xl text-[#452638]">Thank You for Your Enquiry!</h3>
                <p className="text-xs text-[#766E65] max-w-md mx-auto leading-relaxed">
                  We have received your request. A member of our corporate sales team will contact you shortly with customized catalogue options and volume pricing.
                </p>
                <div className="pt-2 flex justify-center space-x-4">
                  <button
                    onClick={openWhatsAppEnquiry}
                    className="px-6 py-2.5 bg-emerald-700 text-white rounded-full text-xs font-semibold uppercase tracking-luxury flex items-center space-x-2 shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Instant WhatsApp Follow-up</span>
                  </button>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 bg-white border border-[#EAE0D5] text-[#452638] rounded-full text-xs font-semibold uppercase tracking-luxury"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#452638]">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-4 py-3 rounded-xl border border-[#EAE0D5] bg-white text-xs focus:ring-1 focus:ring-[#452638] focus:border-[#452638] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#452638]">Company / Event Name</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. Acme Tech / Sharma Wedding"
                      className="w-full px-4 py-3 rounded-xl border border-[#EAE0D5] bg-white text-xs focus:ring-1 focus:ring-[#452638] focus:border-[#452638] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#452638]">Business Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="priya@company.com"
                      className="w-full px-4 py-3 rounded-xl border border-[#EAE0D5] bg-white text-xs focus:ring-1 focus:ring-[#452638] focus:border-[#452638] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#452638]">Mobile Number (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl border border-[#EAE0D5] bg-white text-xs focus:ring-1 focus:ring-[#452638] focus:border-[#452638] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#452638]">Enquiry Purpose</label>
                    <select
                      value={formData.giftingType}
                      onChange={(e) => setFormData({ ...formData, giftingType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#EAE0D5] bg-white text-xs focus:ring-1 focus:ring-[#452638] focus:border-[#452638] outline-none"
                    >
                      <option>Corporate Gifting</option>
                      <option>Wedding Return Gifts</option>
                      <option>Hotel &amp; Hospitality Amenities</option>
                      <option>Retail Store Wholesale</option>
                      <option>Festive Hampers (Diwali / New Year)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#452638]">Approximate Quantity</label>
                    <select
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#EAE0D5] bg-white text-xs focus:ring-1 focus:ring-[#452638] focus:border-[#452638] outline-none"
                    >
                      <option>25 – 49 units</option>
                      <option>50 – 100 units</option>
                      <option>101 – 250 units</option>
                      <option>251 – 500 units</option>
                      <option>500+ units</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#452638]">Destination City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Chennai, Bangalore"
                      className="w-full px-4 py-3 rounded-xl border border-[#EAE0D5] bg-white text-xs focus:ring-1 focus:ring-[#452638] focus:border-[#452638] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#452638]">Specific Requirements / Message</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your event, preferred fragrance notes, budget range, or branding requirements..."
                    className="w-full px-4 py-3 rounded-xl border border-[#EAE0D5] bg-white text-xs focus:ring-1 focus:ring-[#452638] focus:border-[#452638] outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3.5 bg-[#452638] hover:bg-[#5D354D] text-[#FAF7F2] text-xs font-semibold uppercase tracking-luxury rounded-full shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-70"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? "Sending Enquiry..." : "Submit Enquiry"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={openWhatsAppEnquiry}
                    className="py-3.5 px-6 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-luxury rounded-full shadow-xs flex items-center justify-center space-x-2 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat Directly</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── Trust & Assurance ────────────────────────────────────────────── */}
      <section className="py-12 bg-white border-t border-[#EAE0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 space-y-1.5">
              <ShieldCheck className="w-6 h-6 text-[#B69A62] mx-auto" />
              <p className="font-serif text-sm font-medium text-[#452638]">100% Pure Soy Wax</p>
              <p className="text-xs text-[#766E65]">Clean, non-toxic burn without paraffin or phthalates</p>
            </div>
            <div className="p-4 space-y-1.5">
              <Award className="w-6 h-6 text-[#B69A62] mx-auto" />
              <p className="font-serif text-sm font-medium text-[#452638]">GST Invoicing Included</p>
              <p className="text-xs text-[#766E65]">Compliant tax invoicing for all business expenses</p>
            </div>
            <div className="p-4 space-y-1.5">
              <Truck className="w-6 h-6 text-[#B69A62] mx-auto" />
              <p className="font-serif text-sm font-medium text-[#452638]">Pan-India Insured Dispatch</p>
              <p className="text-xs text-[#766E65]">Safe doorstep delivery to single or multiple corporate hubs</p>
            </div>
            <div className="p-4 space-y-1.5">
              <Sparkles className="w-6 h-6 text-[#B69A62] mx-auto" />
              <p className="font-serif text-sm font-medium text-[#452638]">Handcrafted in Chennai</p>
              <p className="text-xs text-[#766E65]">Artisanal small-batch production with rigorous quality audit</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
