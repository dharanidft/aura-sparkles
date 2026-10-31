"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  X, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle, 
  Sparkles,
  Inbox,
  Phone,
  MessageSquare,
  Lock,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalRedirect, 
    sendEmailSignInLink,
    sendOtp,
    verifyOtp
  } = useAuth();

  // Active method: "whatsapp" or "email"
  const [authMethod, setAuthMethod] = useState<"whatsapp" | "email">("whatsapp");

  // WhatsApp OTP states
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneStep, setPhoneStep] = useState<"phone_input" | "otp_input">("phone_input");
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Email link states
  const [email, setEmail] = useState("");
  const [emailStep, setEmailStep] = useState<"input" | "sent">("input");
  const [devLink, setDevLink] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Common states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Reset state on modal open
  useEffect(() => {
    if (isAuthModalOpen) {
      setPhoneStep("phone_input");
      setEmailStep("input");
      setErrorMessage(null);
      setSuccessMessage(null);
      setDevLink(null);
      setDevOtp(null);
      setWarningMessage(null);
      setOtpCode("");
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // ---------------------------------------------------------------------------
  // WhatsApp OTP Handlers
  // ---------------------------------------------------------------------------
  const handleSendWhatsAppOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setDevOtp(null);

    const clean = phone.replace(/\D/g, "");
    if (clean.length < 10) {
      setErrorMessage("Please enter a valid 10-digit Indian WhatsApp mobile number.");
      return;
    }

    setIsLoading(true);
    const res = await sendOtp(clean, "+91", "whatsapp");
    setIsLoading(false);

    if (res.success) {
      setPhoneStep("otp_input");
      setCooldown(60);
      setSuccessMessage(`WhatsApp OTP code sent to +91 ${clean.slice(-10)}`);
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
    } else {
      setErrorMessage(res.error || "Failed to send WhatsApp verification code.");
      if (res.waitSeconds) {
        setCooldown(res.waitSeconds);
      }
    }
  };

  const handleVerifyWhatsAppOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length !== 6) {
      setErrorMessage("Please enter the 6-digit OTP code received on WhatsApp.");
      return;
    }

    setIsLoading(true);
    const clean = phone.replace(/\D/g, "");
    const res = await verifyOtp(clean, cleanOtp, displayName || undefined, "+91");
    setIsLoading(false);

    if (res.success) {
      closeAuthModal();
      if (authModalRedirect && typeof window !== "undefined") {
        window.location.href = authModalRedirect;
      }
    } else {
      setErrorMessage(res.error || "Invalid OTP code. Please check and try again.");
    }
  };

  // ---------------------------------------------------------------------------
  // Email Link Handlers
  // ---------------------------------------------------------------------------
  const handleSendEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setDevLink(null);
    setWarningMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    const returnTarget = authModalRedirect || "/account";
    const res = await sendEmailSignInLink(cleanEmail, returnTarget);
    setIsLoading(false);

    if (res.success) {
      setEmailStep("sent");
      setCooldown(60);
      if (res.devLink) setDevLink(res.devLink);
      if (res.warning) setWarningMessage(res.warning);
    } else {
      setErrorMessage(res.error || "Failed to send sign-in link.");
      if (res.waitSeconds) {
        setCooldown(res.waitSeconds);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="fixed inset-0" 
        onClick={closeAuthModal} 
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-t-[28px] sm:rounded-3xl max-w-md w-full max-h-[90dvh] overflow-y-auto overscroll-contain border-t sm:border border-[#EAE0D5] shadow-2xl p-5 sm:p-8 space-y-5 sm:space-y-6 z-10 animate-sheet-in sm:animate-modal-in pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-8">
        
        {/* Mobile Swipe / Sheet Handle Indicator */}
        <div className="w-12 h-1.5 bg-[#EAE0D5] rounded-full mx-auto sm:hidden -mt-1 mb-2" aria-hidden="true" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 sm:right-5 sm:top-5 p-2 text-[#766E65] hover:text-[#452638] rounded-full hover:bg-[#FAF7F2] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5 pt-1 sm:pt-0">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white shadow-xs border border-[#B69A62]/30 p-0.5 mx-auto">
            <Image src="/images/logo.png" alt="Aura Sparkles" fill className="object-contain" priority />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl text-[#452638]">
              Customer Sign In
            </h2>
            <p className="text-xs text-[#766E65]">
              Instant login to track orders, save addresses &amp; checkout
            </p>
          </div>
        </div>

        {/* Auth Method Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#FAF7F2] rounded-2xl border border-[#EAE0D5]">
          <button
            type="button"
            onClick={() => {
              setAuthMethod("whatsapp");
              setErrorMessage(null);
            }}
            className={`min-h-[44px] py-2.5 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              authMethod === "whatsapp"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[#766E65] hover:text-[#452638]"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp OTP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod("email");
              setErrorMessage(null);
            }}
            className={`min-h-[44px] py-2.5 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              authMethod === "email"
                ? "bg-[#452638] text-white shadow-xs"
                : "text-[#766E65] hover:text-[#452638]"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Link</span>
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success notification */}
        {successMessage && !errorMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* =================================================================== */}
        {/* METHOD 1: WHATSAPP OTP FLOW                                         */}
        {/* =================================================================== */}
        {authMethod === "whatsapp" && (
          <div className="space-y-4">
            {phoneStep === "phone_input" ? (
              <form onSubmit={handleSendWhatsAppOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#452638]">
                    WhatsApp Mobile Number
                  </label>
                  <div className="relative flex rounded-xl border border-[#EAE0D5] bg-white overflow-hidden focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 min-h-[48px]">
                    <span className="px-3 sm:px-3.5 py-3 bg-[#FAF7F2] text-[#452638] font-semibold text-xs border-r border-[#EAE0D5] flex items-center whitespace-nowrap">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      required
                      autoFocus
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full px-3.5 py-3 text-sm text-[#282522] focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-[#766E65]">
                    We will send a 6-digit verification code directly to your WhatsApp
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#766E65]">
                    Your Name <span className="text-[10px] lowercase font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3.5 py-3 bg-white border border-[#EAE0D5] rounded-xl text-sm text-[#282522] focus:outline-none focus:border-[#452638] min-h-[48px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || phone.replace(/\D/g, "").length !== 10}
                  className="w-full min-h-[48px] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs uppercase tracking-luxury font-semibold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Sending WhatsApp OTP...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 text-emerald-200" />
                      <span>Send WhatsApp OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: OTP Entry */
              <form onSubmit={handleVerifyWhatsAppOtp} className="space-y-4 animate-fadeIn">
                {devOtp && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-900">
                        ⚡ WhatsApp OTP Code: <code className="bg-emerald-100 px-2 py-0.5 rounded text-emerald-950 font-mono text-sm">{devOtp}</code>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(devOtp)}
                        className="text-[11px] font-semibold text-emerald-700 underline hover:text-emerald-900 p-1"
                      >
                        Auto-fill
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#452638]">
                      Enter 6-Digit OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneStep("phone_input");
                        setOtpCode("");
                      }}
                      className="text-xs text-[#766E65] hover:text-[#452638] underline py-1"
                    >
                      Change Number
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#766E65] absolute left-3.5 top-4 pointer-events-none" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      required
                      autoFocus
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="••••••"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#EAE0D5] rounded-xl text-center text-xl tracking-[0.3em] font-mono font-bold text-[#282522] focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 min-h-[48px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full min-h-[48px] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs uppercase tracking-luxury font-semibold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify &amp; Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  {cooldown > 0 ? (
                    <span className="text-xs text-[#B69A62]">Resend WhatsApp code in {cooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendWhatsAppOtp}
                      disabled={isLoading}
                      className="min-h-[40px] px-3 text-xs text-emerald-700 font-semibold hover:underline inline-flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resend WhatsApp OTP</span>
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* METHOD 2: EMAIL LINK FLOW                                           */}
        {/* =================================================================== */}
        {authMethod === "email" && (
          <div className="space-y-4">
            {emailStep === "input" ? (
              <form onSubmit={handleSendEmailLink} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#452638]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#766E65] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. yourname@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#EAE0D5] rounded-xl text-xs sm:text-sm text-[#282522] focus:outline-none focus:border-[#452638] focus:ring-1 focus:ring-[#452638]"
                    />
                  </div>
                  <p className="text-[11px] text-[#766E65]">
                    Passwordless email login · No password needed
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.includes("@")}
                  className="w-full py-3.5 px-4 bg-[#452638] hover:bg-[#5D354D] text-white text-xs uppercase tracking-luxury font-semibold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#B69A62]" />
                      <span>Sending Login Link...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#B69A62]" />
                      <span>Send Login Link</span>
                      <ArrowRight className="w-4 h-4 text-[#B69A62]" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-5 animate-fadeIn">
                {devLink && (
                  <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-left space-y-2">
                    <div className="flex items-center space-x-1.5 text-amber-900 text-xs font-semibold">
                      <span>⚡ Instant Sign-In Link (Testing &amp; Development)</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {warningMessage || "Email delivery is awaiting Firebase keys or GoDaddy SMTP password in .env."}
                    </p>
                    <a
                      href={devLink}
                      className="block text-center py-2 px-3 bg-[#452638] hover:bg-[#5D354D] text-white text-xs font-medium rounded-xl transition-colors shadow-xs"
                    >
                      Click Here to Sign In Instantly →
                    </a>
                  </div>
                )}

                <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EAE0D5] text-left space-y-2.5">
                  <div className="flex items-center space-x-2 text-[#452638] text-xs font-semibold">
                    <Inbox className="w-4 h-4 text-[#B69A62]" />
                    <span>Check your email for your sign-in link:</span>
                  </div>
                  <p className="text-xs font-medium text-[#452638] break-all bg-white py-1 px-2.5 rounded border border-[#EAE0D5]">
                    {email}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setEmailStep("input")}
                    className="text-[#766E65] hover:text-[#452638] underline"
                  >
                    Change email
                  </button>
                  {cooldown > 0 ? (
                    <span className="text-[#B69A62] font-semibold">Resend in {cooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendEmailLink}
                      disabled={isLoading}
                      className="text-[#452638] font-semibold hover:underline"
                    >
                      Resend Link
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Security badge footer */}
        <div className="pt-4 border-t border-[#EAE0D5] text-center space-y-1">
          <p className="text-[11px] text-[#766E65] flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure WhatsApp OTP &amp; Email Authentication</span>
          </p>
          <p className="text-[10px] text-[#A89F91]">
            Your shopping cart is preserved and automatically restored upon sign-in.
          </p>
        </div>
      </div>
    </div>
  );
}
