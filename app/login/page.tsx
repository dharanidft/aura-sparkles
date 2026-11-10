"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Inbox,
  MessageSquare,
  Lock
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { OtpInput } from "@/components/OtpInput";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/account";

  const {
    isAuthenticated,
    sendEmailSignInLink,
    sendEmailOtp,
    verifyEmailOtp,
    sendOtp,
    verifyOtp
  } = useAuth();

  // Mode: "whatsapp" or "email"
  const [authMethod, setAuthMethod] = useState<"whatsapp" | "email">("whatsapp");

  // WhatsApp OTP states
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneStep, setPhoneStep] = useState<"phone_input" | "otp_input">("phone_input");

  // Email OTP states
  const [email, setEmail] = useState("");
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [emailStep, setEmailStep] = useState<"input" | "otp_input">("input");
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Common states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTarget);
    }
  }, [isAuthenticated, redirectTarget, router]);

  // ---------------------------------------------------------------------------
  // WhatsApp OTP Handlers
  // ---------------------------------------------------------------------------
  const handleSendWhatsAppOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const clean = phone.replace(/\D/g, "");
    if (clean.length < 10) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setIsLoading(true);
    const res = await sendOtp(clean, "+91", "whatsapp");
    setIsLoading(false);

    if (res.success) {
      setPhoneStep("otp_input");
      setCooldown(60);
      setSuccessMessage(`Verification code sent to +91 ${clean.slice(-10)}`);
    } else {
      setErrorMessage(res.error || "Failed to send verification code.");
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
      setErrorMessage("Please enter the 6-digit OTP code received.");
      return;
    }

    setIsLoading(true);
    const clean = phone.replace(/\D/g, "");
    const res = await verifyOtp(clean, cleanOtp, displayName || undefined, "+91");
    setIsLoading(false);

    if (res.success) {
      router.replace(redirectTarget);
    } else {
      setErrorMessage(res.error || "Invalid OTP code. Please check and try again.");
    }
  };

  // ---------------------------------------------------------------------------
  // Email OTP & Link Handlers
  // ---------------------------------------------------------------------------
  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    const res = await sendEmailOtp(cleanEmail);
    setIsLoading(false);

    if (res.success) {
      setEmailStep("otp_input");
      setCooldown(60);
      setSuccessMessage(`6-digit verification code sent to ${cleanEmail}`);
    } else {
      setErrorMessage(res.error || "Failed to send email verification code.");
      if (res.waitSeconds) {
        setCooldown(res.waitSeconds);
      }
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanOtp = emailOtpCode.trim();
    if (cleanOtp.length !== 6) {
      setErrorMessage("Please enter the 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const res = await verifyEmailOtp(cleanEmail, cleanOtp);
    setIsLoading(false);

    if (res.success) {
      router.replace(redirectTarget);
    } else {
      setErrorMessage(res.error || "Invalid verification code. Please check and try again.");
    }
  };

  const handleSendEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setWarningMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    const res = await sendEmailSignInLink(cleanEmail, redirectTarget);
    setIsLoading(false);

    if (res.success) {
      setCooldown(60);
      setSuccessMessage("Login link dispatched to your email.");
      if (res.warning) setWarningMessage(res.warning);
    } else {
      setErrorMessage(res.error || "Failed to send sign-in link.");
      if (res.waitSeconds) {
        setCooldown(res.waitSeconds);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#EAE0D5] shadow-xl p-8 space-y-6">
        {/* Invisible reCAPTCHA container for Firebase Phone SMS */}
        <div id="recaptcha-container"></div>
        
        {/* Logo and Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white shadow-xs border border-[#B69A62]/30 p-0.5 mx-auto">
              <Image src="/images/logo.png" alt="Aura Sparkles" fill className="object-contain" />
            </div>
          </Link>
          <div className="space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl text-[#452638]">
              Customer Sign In
            </h1>
            <p className="text-xs text-[#766E65]">
              Instant login to track orders, save addresses &amp; checkout
            </p>
          </div>
        </div>

        {/* Auth Method Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF7F2] rounded-2xl border border-[#EAE0D5]">
          <button
            type="button"
            onClick={() => {
              setAuthMethod("whatsapp");
              setErrorMessage(null);
            }}
            className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              authMethod === "whatsapp"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[#766E65] hover:text-[#452638]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp OTP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod("email");
              setErrorMessage(null);
            }}
            className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              authMethod === "email"
                ? "bg-[#452638] text-white shadow-xs"
                : "text-[#766E65] hover:text-[#452638]"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email OTP</span>
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2.5 text-xs text-rose-800 animate-shake">
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
        {/* METHOD 1: WHATSAPP OTP                                              */}
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
                    We will send a 6-digit OTP code directly to your WhatsApp
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

                  <div className="pt-1">
                    <OtpInput
                      value={otpCode}
                      onChange={(val) => setOtpCode(val)}
                      disabled={isLoading}
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
        {/* METHOD 2: EMAIL OTP                                                 */}
        {/* =================================================================== */}
        {authMethod === "email" && (
          <div className="space-y-4">
            {emailStep === "input" ? (
              <form onSubmit={handleSendEmailOtp} className="space-y-4">
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
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#EAE0D5] rounded-xl text-xs sm:text-sm text-[#282522] focus:outline-none focus:border-[#452638] focus:ring-1 focus:ring-[#452638]"
                    />
                  </div>
                  <p className="text-[11px] text-[#766E65]">
                    We will send a 6-digit verification code to your email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.includes("@")}
                  className="w-full min-h-[48px] py-3.5 px-4 bg-[#452638] hover:bg-[#5D354D] text-white text-xs uppercase tracking-luxury font-semibold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#B69A62]" />
                      <span>Sending Email OTP...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#B69A62]" />
                      <span>Send Email OTP</span>
                      <ArrowRight className="w-4 h-4 text-[#B69A62]" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Email OTP Entry */
              <form onSubmit={handleVerifyEmailOtp} className="space-y-4 animate-fadeIn">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#452638]">
                      Enter 6-Digit Email Code
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailStep("input");
                        setEmailOtpCode("");
                      }}
                      className="text-xs text-[#766E65] hover:text-[#452638] underline py-1"
                    >
                      Change Email
                    </button>
                  </div>

                  <div className="pt-1">
                    <OtpInput
                      value={emailOtpCode}
                      onChange={(val) => setEmailOtpCode(val)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || emailOtpCode.length !== 6}
                  className="w-full min-h-[48px] py-3.5 px-4 bg-[#452638] hover:bg-[#5D354D] active:scale-[0.99] text-white text-xs uppercase tracking-luxury font-semibold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#B69A62]" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify &amp; Sign In</span>
                      <ArrowRight className="w-4 h-4 text-[#B69A62]" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    {cooldown > 0 ? (
                      <span className="text-xs text-[#B69A62]">Resend email code in {cooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={isLoading}
                        className="text-[#452638] font-semibold hover:underline inline-flex items-center space-x-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Resend Email OTP</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSendEmailLink}
                    disabled={isLoading}
                    className="text-[#766E65] hover:text-[#452638] text-[11px] underline"
                  >
                    Send magic link instead
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Security badge footer */}
        <div className="pt-4 border-t border-[#EAE0D5] text-center space-y-1">
          <p className="text-[11px] text-[#766E65] flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure WhatsApp OTP &amp; Email Authentication</span>
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
