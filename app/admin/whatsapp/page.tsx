"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle, 
  Smartphone, 
  RefreshCw, 
  Send, 
  ExternalLink, 
  AlertTriangle, 
  ShieldCheck, 
  MessageSquare,
  ArrowRight
} from "lucide-react";

export default function WhatsAppGatewayPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/admin/openwa/status");
      if (res.status === 401) {
        window.location.href = "/admin/login?redirect=/admin/whatsapp";
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setData({ online: false, status: "error", error: err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetch("/api/admin/auth/check")
      .then((res) => {
        if (!res.ok) {
          window.location.href = "/admin/login?redirect=/admin/whatsapp";
        } else {
          fetchStatus();
        }
      })
      .catch(() => {
        window.location.href = "/admin/login?redirect=/admin/whatsapp";
      });

    const interval = setInterval(fetchStatus, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleRestart = async () => {
    setRefreshing(true);
    await fetch("/api/admin/openwa/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restart" }),
    });
    setTimeout(fetchStatus, 2000);
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) return;
    setTestSending(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/openwa/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_message", phone: testPhone }),
      });
      const resData = await res.json();
      if (resData.success) {
        setTestResult("✅ Test message dispatched successfully to WhatsApp!");
      } else {
        setTestResult(`❌ Failed: ${resData.error || JSON.stringify(resData.data)}`);
      }
    } catch (err: any) {
      setTestResult(`❌ Error: ${err.message}`);
    } finally {
      setTestSending(false);
    }
  };

  const isConnected = data?.status === "ready" || data?.status === "authenticated";
  const isQrReady = data?.status === "qr_ready";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 font-sans selection:bg-rose-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                Store Admin
              </span>
              <span className="text-neutral-500 text-xs">•</span>
              <span className="text-neutral-400 text-xs">WhatsApp OTP Gateway</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-white tracking-wide">
              OpenWA Connection Hub
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Real-time monitor and QR code scanner for WhatsApp OTP dispatch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchStatus();
              }}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-200 text-sm font-medium transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-rose-400" : ""}`} />
              Refresh
            </button>
            <a
              href="http://localhost:2785"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium shadow-sm transition active:scale-95"
            >
              OpenWA Dashboard
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${isConnected ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : isQrReady ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-neutral-800 text-neutral-400"}`}>
              {isConnected ? <CheckCircle className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
            </div>
            <div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Session Status</div>
              <div className="text-lg font-semibold text-white capitalize mt-0.5">
                {loading ? "Checking..." : data?.status?.replace("_", " ") || "Disconnected"}
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-neutral-800 text-neutral-300">
              <ShieldCheck className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Gateway Port</div>
              <div className="text-lg font-semibold text-white mt-0.5">
                localhost:2785
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-neutral-800 text-neutral-300">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Phone Connected</div>
              <div className="text-lg font-semibold text-white mt-0.5 truncate max-w-[180px]">
                {data?.phone || "None linked yet"}
              </div>
            </div>
          </div>
        </div>

        {/* Main Interactive Card */}
        {isConnected ? (
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">WhatsApp is Connected!</h2>
              <p className="text-neutral-400 text-sm mt-1 max-w-md mx-auto">
                Linked device active as <span className="text-emerald-400 font-mono font-medium">{data?.phone}</span>. Your Aura store will automatically deliver OTPs via this number for 100% free.
              </p>
            </div>

            {/* Test Message Form */}
            <form onSubmit={handleSendTest} className="max-w-md mx-auto space-y-3 pt-4 border-t border-emerald-500/20">
              <label className="block text-xs uppercase font-medium text-neutral-400 text-left">
                Send a real test message to your phone
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="+919876543210"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={testSending || !testPhone}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  {testSending ? "Sending..." : "Send"}
                </button>
              </div>
              {testResult && (
                <p className="text-xs text-left pt-1 font-mono text-neutral-300">
                  {testResult}
                </p>
              )}
            </form>

            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
              >
                Go to Aura Login Page to test Customer WhatsApp Login
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 md:p-8 items-center">
            {/* QR Code Column */}
            <div className="flex flex-col items-center justify-center bg-white p-6 rounded-xl shadow-lg border border-neutral-200 text-center">
              {data?.qrCode ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.qrCode}
                  alt="WhatsApp OpenWA QR Code"
                  className="w-64 h-64 md:w-72 md:h-72 object-contain"
                />
              ) : (
                <div className="w-64 h-64 flex flex-col items-center justify-center text-neutral-500 space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-neutral-400" />
                  <p className="text-sm font-medium">Generating fresh QR code...</p>
                </div>
              )}
              <div className="mt-3 flex items-center gap-2 text-neutral-600 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Auto-refreshes every 3 seconds
              </div>
            </div>

            {/* Instruction Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Link your WhatsApp in 3 steps
                </h3>
                <p className="text-neutral-400 text-sm mt-1">
                  Once linked, Aura Sparkles sends instant OTP messages directly to your customers.
                </p>
              </div>

              <ol className="space-y-4 text-sm text-neutral-300">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center border border-rose-500/30">
                    1
                  </span>
                  <span>
                    Open **WhatsApp** on your mobile phone.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center border border-rose-500/30">
                    2
                  </span>
                  <span>
                    Tap **Settings** (iPhone) or **Menu ⋮** (Android) ➔ **Linked Devices**.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center border border-rose-500/30">
                    3
                  </span>
                  <span>
                    Tap **Link a Device** and point your phone at the QR code on the left.
                  </span>
                </li>
              </ol>

              <div className="pt-2 border-t border-neutral-800 flex flex-wrap gap-3">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 transition"
                >
                  Regenerate QR / Restart Engine
                </button>
                <a
                  href="/images/openwa-qr.png"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 inline-flex items-center gap-1.5 transition"
                >
                  Direct PNG Link <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Quick Reference Info */}
        <div className="bg-neutral-900/30 border border-neutral-800/80 rounded-xl p-5 text-xs text-neutral-400 space-y-2">
          <div className="font-semibold text-neutral-300 uppercase tracking-wider">
            Configuration Details
          </div>
          <p>
            • Gateway endpoint: <code className="bg-neutral-950 px-1.5 py-0.5 rounded text-neutral-300">http://localhost:2785</code>
          </p>
          <p>
            • Admin API Key: <code className="bg-neutral-950 px-1.5 py-0.5 rounded text-neutral-300">owa_k1_23dff2d2ae23e8ccc174eaeb34b2aee0c4cbf99fdeb8a965edf8013ebc6653ec</code>
          </p>
          <p>
            • OTP Service: Configured in <code className="bg-neutral-950 px-1.5 py-0.5 rounded text-neutral-300">lib/otp-service.ts</code> to automatically dispatch WhatsApp messages through OpenWA.
          </p>
        </div>
      </div>
    </div>
  );
}
