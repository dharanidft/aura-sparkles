"use client";

import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageCircle, Loader2, ExternalLink } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("General Customer Enquiry");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [enquiryId, setEnquiryId] = useState("");
  const [mailtoUrl, setMailtoUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [captchaChallenge, setCaptchaChallenge] = useState<{ token: string; question: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  useEffect(() => {
    document.title = "Contact Us — Aura Sparkles";
    fetch("/api/contact")
      .then((res) => res.json())
      .then((data) => {
        if (data.challenge) setCaptchaChallenge(data.challenge);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim(),
          message: message.trim(),
          _website_hp: honeypot,
          captchaToken: captchaChallenge?.token,
          captchaAnswer: captchaAnswer.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry.");
      }

      const targetMailto = data.mailtoUrl || `mailto:contact@aurasparkles.com?subject=${encodeURIComponent(`[Aura Enquiry: ${subject}] from ${name}`)}&body=${encodeURIComponent(`From: ${name} (${email})\nPhone: ${phone}\n\nMessage:\n${message}`)}`;
      setEnquiryId(data.enquiryId || `ENQ-${Date.now().toString().slice(-6)}`);
      setMailtoUrl(targetMailto);
      setSubmitted(true);

      // Auto-trigger customer email app to send directly to contact@aurasparkles.com
      try {
        if (typeof window !== "undefined") {
          window.location.href = targetMailto;
        }
      } catch (e) {}
    } catch (err: any) {
      console.error("Enquiry submission error:", err);
      const fallbackMailto = `mailto:contact@aurasparkles.com?subject=${encodeURIComponent(`[Aura Enquiry: ${subject}] from ${name}`)}&body=${encodeURIComponent(`From: ${name} (${email})\nPhone: ${phone}\n\nMessage:\n${message}`)}`;
      setMailtoUrl(fallbackMailto);
      setEnquiryId(`ENQ-${Date.now().toString().slice(-6)}`);
      setSubmitted(true);
      try {
        if (typeof window !== "undefined") {
          window.location.href = fallbackMailto;
        }
      } catch (e) {}
    } finally {
      setSubmitting(false);
    }
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
            Whether you have a question regarding an ongoing order, fragrance recommendation, or bespoke wedding/corporate gifting, our team is here to assist. All responses are monitored at <span className="font-medium text-[#452638]">contact@aurasparkles.com</span>.
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
                    <a href="mailto:contact@aurasparkles.com" className="hover:text-[#452638] font-medium transition-colors">
                      contact@aurasparkles.com
                    </a>
                    <p className="text-[10px] text-[#766E65]/80">Monitored official mailbox · Replies within 24 hours</p>
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
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-serif text-2xl text-[#452638]">Enquiry Dispatched Successfully</h3>
                  <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#EAE0D5] max-w-md mx-auto text-left text-xs space-y-1.5 text-[#766E65]">
                    <p><strong className="text-[#452638]">Reference ID:</strong> {enquiryId}</p>
                    <p><strong className="text-[#452638]">Sent To:</strong> contact@aurasparkles.com</p>
                    <p><strong className="text-[#452638]">Subject:</strong> {subject}</p>
                    <p className="text-[11px] text-[#766E65]/90 pt-1">
                      Our customer concierge reviews incoming mail at <span className="font-semibold text-[#452638]">contact@aurasparkles.com</span> and will respond to <span className="font-semibold text-[#452638]">{email}</span> within 24 business hours.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                    {mailtoUrl && (
                      <a
                        href={mailtoUrl}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#452638] hover:bg-[#5D354D] text-white text-xs font-semibold rounded-full flex items-center justify-center space-x-2 transition-colors shadow-sm"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#B69A62]" />
                        <span>Send via Email App</span>
                      </a>
                    )}
                    <a
                      href={`https://wa.me/919385328336?text=${encodeURIComponent(`Hi AURA SPARKLES, I submitted an enquiry (${enquiryId}):\nName: ${name}\nSubject: ${subject}\nMessage: ${message}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-full flex items-center justify-center space-x-2 transition-colors shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-white" />
                      <span>Send via WhatsApp</span>
                    </a>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setName("");
                        setEmail("");
                        setPhone("");
                        setMessage("");
                        setErrorMessage("");
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 border border-[#452638] text-xs font-semibold uppercase rounded-full text-[#452638] hover:bg-[#FAF6F0] transition-colors"
                    >
                      New Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-[#EAE0D5] pb-3">
                    <h2 className="font-serif text-2xl text-[#452638]">
                      Send Us a Message
                    </h2>
                    <p className="text-xs text-[#766E65] mt-1">
                      Enquiries are automatically routed directly to our concierge team at <span className="font-semibold text-[#452638]">contact@aurasparkles.com</span>.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                      {errorMessage}
                    </div>
                  )}

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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#452638] mb-1">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                      />
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

                  {/* Honeypot Decoy Field (Invisible to legitimate human users) */}
                  <div className="hidden" aria-hidden="true" style={{ display: "none", opacity: 0, position: "absolute", left: "-9999px" }}>
                    <label htmlFor="_website_hp">Do not fill this field</label>
                    <input
                      id="_website_hp"
                      type="text"
                      name="_website_hp"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  {/* Anti-Bot Verification Challenge */}
                  {captchaChallenge && (
                    <div className="p-3 bg-[#FAF7F2] border border-[#EAE0D5] rounded-xl space-y-1.5 text-left">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#452638]">
                        {captchaChallenge.question} *
                      </label>
                      <input
                        type="number"
                        required
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        placeholder="Enter number"
                        className="w-32 px-3 py-1.5 bg-white border border-[#EAE0D5] rounded-lg text-xs focus:outline-none focus:border-[#452638]"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-[#452638] hover:bg-[#5D354D] text-white text-xs font-semibold tracking-luxury uppercase rounded-xl flex items-center justify-center space-x-2 transition-all shadow-sm disabled:opacity-70 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B69A62]" />
                        <span>SENDING TO CONTACT@AURASPARKLES.COM...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-[#B69A62]" />
                        <span>SUBMIT ENQUIRY</span>
                      </>
                    )}
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
