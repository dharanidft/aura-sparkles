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
  Inbox
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/account";

  const {
    customer,
    isAuthenticated,
    sendEmailSignInLink,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"input" | "sent">("input");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

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

  const handleSendLink = async (e: React.FormEvent) => {
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
    const res = await sendEmailSignInLink(cleanEmail, redirectTarget);
    setIsLoading(false);

    if (res.success) {
      setStep("sent");
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

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    setErrorMessage(null);
    setDevLink(null);
    setWarningMessage(null);
    setIsLoading(true);
    const res = await sendEmailSignInLink(email.trim().toLowerCase(), redirectTarget);
    setIsLoading(false);

    if (res.success) {
      setCooldown(60);
      if (res.devLink) setDevLink(res.devLink);
      if (res.warning) setWarningMessage(res.warning);
    } else {
      setErrorMessage(res.error || "Failed to resend sign-in link.");
      if (res.waitSeconds) {
        setCooldown(res.waitSeconds);
      }
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
              {step === "input" ? "Customer Sign In" : "Check Your Email"}
            </h1>
            <p className="text-xs text-[#766E65]">
              {step === "input"
                ? "Enter your email address to receive a secure passwordless sign-in link"
                : `We have sent your secure sign-in link to:`}
            </p>
            {step === "sent" && (
              <p className="text-xs font-semibold text-[#452638] break-all bg-[#FAF7F2] py-1.5 px-3 rounded-lg border border-[#EAE0D5] inline-block">
                {email}
              </p>
            )}
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2.5 text-xs text-rose-800 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: EMAIL INPUT FORM */}
        {step === "input" && (
          <form onSubmit={handleSendLink} className="space-y-4">
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
                No password or numeric OTP required · We send you a direct sign-in link
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
                  <span>Dispatching Login Link...</span>
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
        )}

        {/* STEP 2: CHECK YOUR EMAIL CONFIRMATION */}
        {step === "sent" && (
          <div className="space-y-5 animate-fadeIn">
            {devLink && (
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-left space-y-2">
                <div className="flex items-center space-x-1.5 text-amber-900 text-xs font-semibold">
                  <span>⚡ Instant Sign-In Link (Testing & Development)</span>
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
                <span>Next steps to complete sign-in:</span>
              </div>
              <ol className="text-xs text-[#766E65] space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Open the email from <strong>Aura Sparkles</strong>.</li>
                <li>Click the <strong>Sign In to Aura Sparkles</strong> link.</li>
                <li>Your browser will authenticate and restore your cart automatically!</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep("input")}
                className="text-[#766E65] hover:text-[#452638] text-xs underline"
              >
                Change email address
              </button>

              <div>
                {cooldown > 0 ? (
                  <span className="text-[#B69A62] font-semibold">Resend link in {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="text-[#452638] font-semibold hover:underline flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend Link</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Security badge footer */}
        <div className="pt-4 border-t border-[#EAE0D5] text-center space-y-1">
          <p className="text-[11px] text-[#766E65] flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firebase Passwordless Email Authentication · Zero SMS Fees</span>
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
