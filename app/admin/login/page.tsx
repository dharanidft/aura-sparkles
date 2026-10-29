"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ShieldCheck, ArrowRight, RefreshCw, AlertTriangle, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/admin";

  const [passcode, setPasscode] = useState("");
  const [username, setUsername] = useState("Store Administrator");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if already authenticated
  useEffect(() => {
    fetch("/api/admin/auth/check")
      .then((res) => {
        if (res.ok) {
          router.replace(redirectTarget);
        }
      })
      .catch(() => {});
  }, [redirectTarget, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!passcode.trim()) {
      setErrorMessage("Please enter the store administrator passcode.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim(), username }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        // Redirect to admin dashboard
        router.replace(redirectTarget);
      } else {
        setErrorMessage(data.error || "Invalid passcode. Access denied.");
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || "Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white">
      <div className="max-w-md w-full bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Header with Logo */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-neutral-800 border border-neutral-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-medium uppercase tracking-widest mb-1.5">
              Restricted Area
            </div>
            <h1 className="text-2xl font-serif text-white tracking-wide">
              Aura Admin Portal
            </h1>
            <p className="text-neutral-400 text-xs mt-1">
              Protected by server-side role verification and rate-limiting.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Admin Passcode
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="password"
                required
                autoFocus
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter master passcode"
                className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !passcode}
            className="w-full min-h-[48px] py-3.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white text-xs uppercase tracking-widest font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Verifying Authorization...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-rose-200" />
                <span>Unlock Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="pt-4 border-t border-neutral-800/80 text-center space-y-2">
          <p className="text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
            <span>Unauthorized access attempts are logged and monitored.</span>
          </p>
          <div>
            <Link
              href="/"
              className="text-xs text-neutral-400 hover:text-white underline underline-offset-4"
            >
              ← Back to Aura Sparkles Store
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
