"use client";

import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Customer Enquiry");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Contact Us — Aura Sparkles";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="py-16 md:py-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">
            We Would Love to Hear from You
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#452638] font-normal tracking-tight">
            Contact Aura Sparkles
          </h1>
          <p className="text-sm text-[#766E65]">
            Whether you have a question regarding an ongoing order, fragrance recommendation, or bespoke wedding/corporate gifting, our team is here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Direct Verified Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#EAE0D5] shadow-subtle space-y-4">
              <h2 className="font-serif text-xl font-medium text-[#452638]">
                Get in Touch
              </h2>

              <div className="space-y-4 text-xs text-[#766E65]">
                <div className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 text-[#B69A62] mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#452638]">Email Support</p>
                    <a href="mailto:care@aurasparkles.in" className="hover:text-[#452638] transition-colors">
                      care@aurasparkles.in
                    </a>
                    <p className="text-[10px] text-[#766E65]/80">Responses within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 text-[#B69A62] mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#452638]">Concierge Helpline &amp; Telephone</p>
                    <a href="tel:+919385328336" className="text-sm font-semibold text-[#452638] hover:underline">
                      +91 93853 28336
                    </a>
                    <p className="text-[10px] text-[#766E65]/80">Mon – Sat: 10:00 AM – 7:00 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-[#B69A62] mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#452638]">Studio &amp; Fulfillment</p>
                    <p>Aura Sparkles Fragrance Atelier</p>
                    <p>Ayanambakkam, Vadanoombal, Tamil Nadu 600095, India</p>
                  </div>
                </div>
              </div>

              {/* Requirement 1: Official WhatsApp link with preserved message */}
              <div className="pt-2">
                <a
                  href="https://wa.me/919385328336?text=Hi%20AURA%20SPARKLES,%20I%20have%20an%20enquiry%20regarding%20fragrances"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp (+91 93853 28336)</span>
                </a>
              </div>
            </div>

            {/* Corporate & Event Gifting Banner */}
            <div className="p-6 bg-[#F2E9DF] rounded-2xl border border-[#E8C9C5] space-y-2 text-xs">
              <p className="font-serif text-lg font-medium text-[#452638]">
                Bespoke Gifting &amp; Weddings
              </p>
              <p className="text-[#766E65] leading-relaxed">
                Planning wedding favors, festive hampers, or corporate appreciation gifts? We offer customized label monograms and custom candle packaging with special bulk rates.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 rounded-3xl border border-[#EAE0D5] shadow-card">
              {submitted ? (
                <div className="text-center py-16 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="font-serif text-2xl text-[#452638]">Message Sent Successfully</h3>
                  <p className="text-xs text-[#766E65] max-w-sm mx-auto">
                    Thank you for reaching out. An Aura customer specialist will review your request and reply shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName("");
                      setEmail("");
                      setMessage("");
                    }}
                    className="mt-4 px-6 py-2 border border-[#452638] text-xs font-semibold uppercase rounded-full text-[#452638]"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="font-serif text-2xl text-[#452638] border-b border-[#EAE0D5] pb-3">
                    Send Us a Message
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#452638] mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Maya Iyer"
                        className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#452638] mb-1">Your Email *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. maya@example.com"
                        className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#452638] mb-1">Enquiry Type</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                    >
                      <option>General Customer Enquiry</option>
                      <option>Order Tracking &amp; Delivery Status</option>
                      <option>Wedding &amp; Event Bulk Favors</option>
                      <option>Corporate Gifting</option>
                      <option>Press &amp; Collaboration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#452638] mb-1">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please share the details of your enquiry..."
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#452638] hover:bg-[#5D354D] text-white text-xs font-semibold tracking-luxury uppercase rounded-xl flex items-center justify-center space-x-2 transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5 text-[#B69A62]" />
                    <span>SUBMIT ENQUIRY</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
