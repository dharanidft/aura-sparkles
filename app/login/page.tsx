"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Phone, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "USA / Canada", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
];

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/account";

  const {
    isAuthenticated,
    sendOtp,
    verifyOtp,
    authStep,
    cooldown,
    phoneNumber,
    countryCode,
    isSubmitting,
    error,
    clearError
  } = useAuth();

  const [selectedCountry, setSelectedCountry] = useState("+91");
  const [phoneInput, setPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTarget);
    }
  }, [isAuthenticated, redirectTarget, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const cleanNumber = phoneInput.replace(/\D/g, "");
    if (!cleanNumber || cleanNumber.length < 7) {
      return;
    }
    const fullPhone = `${selectedCountry}${cleanNumber}`;
    try {
      await sendOtp(fullPhone);
    } catch {
      // handled in context
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const cleanOtp = otpInput.replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      return;
    }
    try {
      await verifyOtp(cleanOtp);
      router.replace(redirectTarget);
    } catch {
      // handled in context
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#EAE0D5] shadow-xl p-8 space-y-6">
        
        {/* Logo and Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white shadow-xs border border-[#B69A62]/30 p-0.5 mx-auto">
              <Image src="/images/logo.png" alt="Aura Sparkles" fill className="object-contain" />
            </div>
          </Link>
          <div className="space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl text-[#452638]">
              {authStep === "PHONE" ? "Customer Sign In" : "Verify Mobile OTP"}
            </h1>
            <p className="text-xs text-[#766E65]">
              {authStep === "PHONE"
                ? "Enter your mobile number to receive a secure one-time password"
                : `Enter the 6-digit verification code sent to ${phoneNumber}`}
            </p>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2.5 text-xs text-rose-800 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: PHONE INPUT */}
        {authStep === "PHONE" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#452638]">
                Mobile Number
              </label>
              <div className="flex rounded-xl border border-[#EAE0D5] focus-within:border-[#452638] focus-within:ring-1 focus-within:ring-[#452638] bg-white overflow-hidden transition-all">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="bg-[#FAF7F2] border-r border-[#EAE0D5] px-3 py-3 text-xs text-[#452638] font-semibold focus:outline-none cursor-pointer"
                >
                  {COUNTRY_CODES.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.flag} {item.code}
                    </option>
                  ))}
                </select>

                <input
                  type="tel"
                  required
                  autoFocus
                  placeholder="Enter 10-digit mobile number"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 px-4 py-3 text-sm text-[#282522] placeholder:text-[#A89F91] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || phoneInput.length < 7}
              className="w-full py-3.5 px-4 bg-[#452638] hover:bg-[#5D354D] text-white text-xs uppercase tracking-luxury font-semibold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#B69A62]" />
                  <span>Dispatching OTP...</span>
                </>
              ) : (
                <>
                  <span>Send One-Time Password</span>
                  <ArrowRight className="w-4 h-4 text-[#B69A62]" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {authStep === "OTP" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#452638]">
                6-Digit Security Code
              </label>
              <input
                type="text"
                required
                autoFocus
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold py-3 px-4 border border-[#EAE0D5] rounded-xl focus:outline-none focus:border-[#452638] focus:ring-1 focus:ring-[#452638]"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#766E65]">
              <span>Didn&apos;t receive code?</span>
              {cooldown > 0 ? (
                <span className="text-[#B69A62] font-semibold">Resend in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => phoneNumber && sendOtp(phoneNumber)}
                  disabled={isSubmitting}
                  className="text-[#452638] font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otpInput.length !== 6}
              className="w-full py-3.5 px-4 bg-[#452638] hover:bg-[#5D354D] text-white text-xs uppercase tracking-luxury font-semibold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#B69A62]" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verify &amp; Continue</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Security badge footer */}
        <div className="pt-4 border-t border-[#EAE0D5] text-center space-y-1">
          <p className="text-[11px] text-[#766E65] flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit Cryptographic HMAC Session Security</span>
          </p>
          <p className="text-[10px] text-[#766E65]">
            By continuing, you agree to Aura Sparkles Terms &amp; Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#452638] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
