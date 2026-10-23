"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Mail, 
  ArrowRight, 
  ShieldCheck,
  Sparkles 
} from "lucide-react";
import { 
  isFirebaseEmailSignInLink, 
  signInWithFirebaseEmailLink, 
  EMAIL_SIGNIN_STORAGE_KEY 
} from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

type VerificationStatus = "VERIFYING" | "NEEDS_EMAIL" | "SUCCESS" | "ERROR";

function VerifyEmailLinkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshCustomer } = useAuth();

  const [status, setStatus] = useState<VerificationStatus>("VERIFYING");
  const [errorMessage, setErrorMessage] = useState("");
  const [crossDeviceEmail, setCrossDeviceEmail] = useState("");
  const [isSubmittingManualEmail, setIsSubmittingManualEmail] = useState(false);

  // Sanitize return redirect to avoid open redirects
  const rawRedirect = searchParams.get("redirect") || "/account";
  const safeRedirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") && !rawRedirect.includes("://")
    ? rawRedirect
    : "/account";

  const handleCompleteServerVerification = async (email: string, token: string) => {
    try {
      const res = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to verify sign-in link.");
      }

      await refreshCustomer();
      setStatus("SUCCESS");
      setTimeout(() => {
        router.replace(safeRedirect);
      }, 1200);
    } catch (err: any) {
      setStatus("ERROR");
      setErrorMessage(err.message || "This sign-in link is invalid or has expired.");
    }
  };

  const handleCompleteFirebaseVerification = async (emailToUse: string) => {
    try {
      const currentUrl = window.location.href;
      const credential = await signInWithFirebaseEmailLink(emailToUse, currentUrl);
      const user = credential.user;

      // Sync session to backend
      const res = await fetch("/api/auth/email/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to establish authenticated session.");
      }

      await refreshCustomer();
      setStatus("SUCCESS");
      setTimeout(() => {
        router.replace(safeRedirect);
      }, 1200);
    } catch (err: any) {
      console.error("[Firebase Link Verification] Error:", err);
      setStatus("ERROR");
      if (err.code === "auth/invalid-action-code") {
        setErrorMessage("This sign-in link is invalid, expired, or has already been used.");
      } else {
        setErrorMessage(err.message || "Failed to sign in with link. Please request a new one.");
      }
    }
  };

  useEffect(() => {
    const processLink = async () => {
      const currentUrl = window.location.href;
      const serverToken = searchParams.get("token");
      const urlEmail = searchParams.get("email");

      // 1. Server-generated link token
      if (serverToken && urlEmail) {
        await handleCompleteServerVerification(urlEmail, serverToken);
        return;
      }

      // 2. Firebase native email link
      if (isFirebaseEmailSignInLink(currentUrl)) {
        let storedEmail = "";
        if (typeof window !== "undefined") {
          storedEmail = window.localStorage.getItem(EMAIL_SIGNIN_STORAGE_KEY) || "";
        }
        if (!storedEmail && urlEmail) {
          storedEmail = urlEmail;
        }

        if (storedEmail) {
          await handleCompleteFirebaseVerification(storedEmail);
        } else {
          // Cross-device recovery: Prompt user for email
          setStatus("NEEDS_EMAIL");
        }
        return;
      }

      // 3. Fallback: No valid link parameters found
      setStatus("ERROR");
      setErrorMessage("No valid sign-in link was detected in this URL. Please request a fresh login link.");
    };

    processLink();
  }, [searchParams]);

  const handleManualEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crossDeviceEmail.trim()) return;

    setIsSubmittingManualEmail(true);
    setStatus("VERIFYING");
    await handleCompleteFirebaseVerification(crossDeviceEmail.trim());
    setIsSubmittingManualEmail(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-20 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#EAE0D5] shadow-xl p-8 text-center space-y-6">
        
        {/* Brand header */}
        <div className="space-y-2">
          <Link href="/" className="inline-block">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white shadow-xs border border-[#B69A62]/30 p-0.5 mx-auto">
              <Image src="/images/logo.png" alt="Aura Sparkles" fill className="object-contain" />
            </div>
          </Link>
          <h1 className="font-serif text-2xl text-[#452638]">Aura Sparkles</h1>
        </div>

        {/* STATE 1: VERIFYING */}
        {status === "VERIFYING" && (
          <div className="py-8 space-y-4">
            <RefreshCw className="w-10 h-10 text-[#B69A62] animate-spin mx-auto" />
            <div className="space-y-1">
              <h2 className="font-serif text-lg text-[#452638]">Verifying Secure Sign-In Link</h2>
              <p className="text-xs text-[#766E65]">
                Authenticating your account and restoring your bag items...
              </p>
            </div>
          </div>
        )}

        {/* STATE 2: CROSS-DEVICE EMAIL CONFIRMATION */}
        {status === "NEEDS_EMAIL" && (
          <div className="space-y-4 text-left py-2">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-[#FAF3EE] text-[#B69A62] flex items-center justify-center mx-auto">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-lg text-[#452638]">Confirm Your Email</h2>
              <p className="text-xs text-[#766E65]">
                You opened this login link on a different device or browser. Please confirm your email address to complete sign in.
              </p>
            </div>

            <form onSubmit={handleManualEmailSubmit} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#452638]">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={crossDeviceEmail}
                  onChange={(e) => setCrossDeviceEmail(e.target.value)}
                  placeholder="e.g. yourname@example.com"
                  className="w-full px-4 py-3 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingManualEmail || !crossDeviceEmail.includes("@")}
                className="w-full py-3 bg-[#452638] hover:bg-[#5D354D] text-white text-xs uppercase tracking-luxury font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>Verify &amp; Continue</span>
                <ArrowRight className="w-4 h-4 text-[#B69A62]" />
              </button>
            </form>
          </div>
        )}

        {/* STATE 3: SUCCESS */}
        {status === "SUCCESS" && (
          <div className="py-6 space-y-3 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-xl text-[#452638]">Welcome to Aura Sparkles</h2>
            <p className="text-xs text-[#766E65]">
              You have signed in securely. Redirecting you right now...
            </p>
          </div>
        )}

        {/* STATE 4: ERROR */}
        {status === "ERROR" && (
          <div className="py-4 space-y-4 animate-shake">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-lg text-[#452638]">Sign-In Link Expired or Invalid</h2>
              <p className="text-xs text-[#766E65] leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href={`/login?redirect=${encodeURIComponent(safeRedirect)}`}
                className="inline-block w-full py-3 bg-[#452638] hover:bg-[#5D354D] text-white text-xs uppercase tracking-luxury font-semibold rounded-xl transition-colors"
              >
                Request a New Login Link
              </Link>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-[#EAE0D5] text-[10px] text-[#766E65] flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Passwordless Email Authentication · Aura Sparkles</span>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#452638] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailLinkContent />
    </Suspense>
  );
}
