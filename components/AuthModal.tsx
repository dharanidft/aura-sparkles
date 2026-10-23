"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  X, 
  Smartphone, 
  KeyRound, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle,
  User,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+1", country: "USA / Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
];

export function AuthModal() {
  const router = useRouter();
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalRedirect, 
    sendOtp, 
    verifyOtp 
  } = useAuth();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [displayName, setDisplayName] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Reset state when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep("phone");
      setOtp(["", "", "", "", "", ""]);
      setErrorMessage(null);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const clean = phone.replace(/\D/g, "");
    if (countryCode === "+91" && (clean.length !== 10 || !/^[6-9]\d{9}$/.test(clean))) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (clean.length < 8) {
      setErrorMessage("Please enter a valid mobile number.");
      return;
    }

    setIsLoading(true);
    const res = await sendOtp(clean, countryCode);
    setIsLoading(false);

    if (res.success) {
      setStep("otp");
      setCooldown(60);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } else {
      setErrorMessage(res.error || "Failed to send OTP.");
      if (res.waitSeconds) {
        setCooldown(res.waitSeconds);
      }
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto advance to next box
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || "";
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[focusIndex]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter all 6 digits of your verification code.");
      return;
    }

    const clean = phone.replace(/\D/g, "");
    setIsLoading(true);
    const res = await verifyOtp(clean, fullOtp, displayName, countryCode);
    setIsLoading(false);

    if (res.success) {
      closeAuthModal();
      if (authModalRedirect) {
        router.push(authModalRedirect);
      }
    } else {
      setErrorMessage(res.error || "Invalid OTP code. Please try again.");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isLoading) return;
    setErrorMessage(null);
    setIsLoading(true);
    const clean = phone.replace(/\D/g, "");
    const res = await sendOtp(clean, countryCode);
    setIsLoading(false);

    if (res.success) {
      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } else {
      setErrorMessage(res.error || "Failed to resend OTP.");
      if (res.waitSeconds) {
        setCooldown(res.waitSeconds);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      {/* Hidden container for Firebase invisible reCAPTCHA */}
      <div id="recaptcha-container" />

      <div className="bg-white rounded-3xl max-w-md w-full border border-[#EAE0D5] shadow-2xl overflow-hidden relative my-auto animate-scale">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 text-[#766E65] hover:text-[#452638] rounded-full hover:bg-neutral-100 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-b from-[#FAF6F0] to-white p-6 sm:p-8 text-center border-b border-[#EAE0D5]/50">
          <div className="relative w-14 h-14 mx-auto rounded-full overflow-hidden bg-white shadow-sm border border-[#B69A62]/40 p-1 mb-3">
            <Image src="/images/logo.png" alt="Aura Sparkles" fill className="object-contain" />
          </div>
          <h3 className="font-serif text-2xl font-medium text-[#452638]">
            {step === "phone" ? "Welcome to Aura Sparkles" : "Verify Your Mobile"}
          </h3>
          <p className="text-xs text-[#766E65] mt-1 max-w-xs mx-auto">
            {step === "phone"
              ? "Sign in with your mobile number to access saved addresses, track orders, and complete checkout."
              : `Enter the 6-digit code sent via SMS to ${countryCode} ${phone.slice(-10)}`}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-800 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#452638] mb-1.5 uppercase tracking-wider">
                  Mobile Number *
                </label>
                <div className="flex rounded-xl border border-[#EAE0D5] overflow-hidden focus-within:border-[#452638] focus-within:ring-1 focus-within:ring-[#452638] transition-all bg-white">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-2.5 py-3 bg-neutral-50 border-r border-[#EAE0D5] text-xs font-medium text-[#452638] focus:outline-none"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    required
                    autoFocus
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="98765 43210"
                    className="flex-1 px-3.5 py-3 text-sm text-[#282522] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#766E65] mt-1.5 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B69A62]" />
                  <span>We will send a 6-digit one-time code via SMS.</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#452638] hover:bg-[#5D354D] text-white rounded-xl text-xs font-semibold uppercase tracking-luxury transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#B69A62]" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Optional Name for first-time login */}
              <div>
                <label className="block text-xs font-semibold text-[#452638] mb-1.5 uppercase tracking-wider">
                  Your Full Name (Optional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#766E65] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
                  />
                </div>
              </div>

              {/* 6 Digit Box Input */}
              <div>
                <label className="block text-xs font-semibold text-[#452638] mb-2 uppercase tracking-wider text-center">
                  6-Digit Verification Code
                </label>
                <div className="flex justify-between gap-2 max-w-xs mx-auto">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpInputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={idx === 0 ? handlePasteOtp : undefined}
                      className="w-11 h-12 text-center text-lg font-bold font-mono text-[#452638] bg-neutral-50 border border-[#EAE0D5] rounded-xl focus:outline-none focus:border-[#452638] focus:bg-white focus:ring-1 focus:ring-[#452638] transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Resend Cooldown */}
              <div className="text-center text-xs text-[#766E65] pt-1">
                {cooldown > 0 ? (
                  <p>Resend code in <strong className="text-[#452638]">{cooldown}s</strong></p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="text-[#B69A62] font-semibold hover:underline"
                  >
                    Didn&apos;t receive code? Resend OTP
                  </button>
                )}
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isLoading || otp.join("").length !== 6}
                  className="w-full py-3.5 bg-[#452638] hover:bg-[#5D354D] text-white rounded-xl text-xs font-semibold uppercase tracking-luxury transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#B69A62]" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify &amp; Continue</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="w-full py-2 text-xs text-[#766E65] hover:text-[#452638] transition-colors"
                >
                  ← Edit mobile number ({countryCode} {phone})
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 border-t border-[#EAE0D5]/50 text-center">
            <p className="text-[10px] text-[#766E65]">
              By logging in, you agree to Aura Sparkles&apos;{" "}
              <a href="/terms" className="underline hover:text-[#452638]">Terms</a> &amp;{" "}
              <a href="/privacy-policy" className="underline hover:text-[#452638]">Privacy Policy</a>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
