"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  QrCode, 
  Copy, 
  Check, 
  Smartphone, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowLeft,
  X,
  Loader2,
  FileText
} from "lucide-react";
import { formatINR } from "@/lib/shipping";

export default function UpiPaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = (params.orderId as string) || "";
  const accessKey = searchParams.get("key") || "";

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Copy feedback
  const [copied, setCopied] = useState(false);

  // Proof upload form state
  const [utr, setUtr] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = `UPI Payment (${orderId}) — Aura Sparkles`;

    async function fetchOrder() {
      if (!orderId || !accessKey) {
        setError("Missing order reference or access security key.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/orders/${orderId}?key=${accessKey}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Unable to load order details.");
        }

        setOrderData(data.order);
        setPaymentData(data.payment);

        if (data.order.hasProof) {
          setUploadSuccess(true);
          setUtr(data.order.transactionReference || "");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load order.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, accessKey]);

  // Copy UPI ID to clipboard
  const handleCopyUpiId = async () => {
    if (!paymentData?.upiId) return;
    try {
      await navigator.clipboard.writeText(paymentData.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      alert(`UPI ID: ${paymentData.upiId}`);
    }
  };

  // Launch UPI App on Mobile
  const handlePayUsingUpi = () => {
    if (!paymentData?.upiIntentUri) return;
    window.location.href = paymentData.upiIntentUri;
  };

  // Handle File Selection with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type.toLowerCase())) {
      setUploadError("Invalid file type. Only JPG, JPEG, and PNG images are accepted.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5 MB.`);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Payment Proof to Server
  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    const cleanUtr = utr.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      setUploadError("Please enter a valid 12-digit UPI UTR / Transaction Reference ID.");
      return;
    }

    if (!selectedFile && !orderData?.hasProof) {
      setUploadError("Please attach your payment screenshot before submitting.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("accessKey", accessKey);
      formData.append("utr", cleanUtr);
      if (selectedFile) {
        formData.append("screenshot", selectedFile);
      }

      const res = await fetch(`/api/orders/${orderId}/upload-proof`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit payment proof.");
      }

      setUploadSuccess(true);
      setOrderData((prev: any) => ({
        ...prev,
        paymentStatus: "PAYMENT_REVIEW",
        hasProof: true,
        transactionReference: cleanUtr,
      }));
    } catch (err: any) {
      console.error("Proof submission error:", err);
      setUploadError(err.message || "Failed to submit screenshot proof. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center bg-white min-h-screen flex items-center justify-center">
        <div className="space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#B69A62] mx-auto" />
          <p className="text-xs uppercase tracking-luxury text-[#452638]">Generating Secure UPI Session...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="py-20 text-center bg-white min-h-screen">
        <div className="max-w-md mx-auto p-8 bg-white rounded-2xl border border-[#EAE0D5] space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
          <h1 className="font-serif text-2xl text-[#452638]">Unable to Access Payment</h1>
          <p className="text-xs text-[#766E65]">{error || "The specified order could not be loaded."}</p>
          <Link
            href="/cart"
            className="inline-block px-6 py-2.5 bg-[#452638] text-white text-xs uppercase tracking-luxury rounded-full hover:bg-[#5D354D]"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 md:py-16 bg-[#FAF7F2]/40 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/shop"
            className="inline-flex items-center space-x-1.5 text-xs text-[#766E65] hover:text-[#452638] font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Store</span>
          </Link>
          <div className="flex items-center space-x-2 text-[11px] text-[#766E65]">
            <ShieldCheck className="w-4 h-4 text-[#B69A62]" />
            <span>HDFC Bank Direct UPI</span>
          </div>
        </div>

        {/* Header Summary */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE0D5] shadow-card text-center space-y-3">
          <p className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">
            Order Payment Portal
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#452638]">
            Pay via UPI • {formatINR(orderData.totalRupees)}
          </h1>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#FAF6F0] rounded-full border border-[#EAE0D5] text-xs text-[#766E65]">
            <span>Order Reference:</span>
            <strong className="text-[#452638] font-mono">{orderData.orderId}</strong>
          </div>
        </div>

        {/* ─── Step 1: Complete UPI Payment ────────────────────────────── */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE0D5] shadow-card space-y-6">
          <div className="border-b border-[#EAE0D5] pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl text-[#452638]">Step 1: Scan &amp; Pay Exact Amount</h2>
              <p className="text-xs text-[#766E65] mt-0.5">
                Pay using Google Pay, PhonePe, Paytm, BHIM, or any HDFC/Bank UPI app.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {formatINR(orderData.totalRupees)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: QR Code */}
            <div className="text-center space-y-3 bg-[#FAF6F0]/60 p-6 rounded-2xl border border-[#EAE0D5]">
              <div className="relative w-56 h-56 mx-auto bg-white p-3 rounded-2xl border border-[#EAE0D5] shadow-xs flex items-center justify-center">
                <Image
                  src={paymentData.qrImageUrl}
                  alt="Aura Sparkles UPI QR Code"
                  width={220}
                  height={220}
                  className="rounded-lg object-contain"
                  priority
                />
              </div>
              <p className="text-[11px] text-[#766E65]">
                Scan with any UPI app on your phone to pay directly.
              </p>
            </div>

            {/* Right: UPI ID & Mobile App Button */}
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#452638] uppercase tracking-wider">
                  Official Merchant UPI ID:
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 px-4 py-3 bg-[#FAF6F0] border border-[#EAE0D5] rounded-xl font-mono text-sm text-[#452638] font-bold select-all truncate">
                    {paymentData.upiId}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpiId}
                    className="px-4 py-3 bg-white border border-[#452638] text-[#452638] hover:bg-[#FAF6F0] rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#B69A62]" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile Pay Using UPI button */}
              <div>
                <button
                  type="button"
                  onClick={handlePayUsingUpi}
                  className="w-full py-3.5 bg-[#452638] hover:bg-[#5D354D] text-white text-xs font-semibold uppercase tracking-luxury rounded-xl flex items-center justify-center space-x-2 transition-all shadow-sm"
                >
                  <Smartphone className="w-4 h-4 text-[#B69A62]" />
                  <span>PAY USING UPI APP (MOBILE)</span>
                </button>
                <p className="text-[10px] text-center text-[#766E65] mt-1.5">
                  Opens GPay, PhonePe, Paytm, or BHIM directly on mobile devices.
                </p>
              </div>

              {/* Important Instruction Notice */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1 text-xs text-amber-900">
                <p className="font-semibold flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                  <span>Important Instructions:</span>
                </p>
                <ul className="text-[11px] text-amber-800 list-disc list-inside space-y-0.5 leading-relaxed">
                  <li>Please pay the exact amount: <strong>{formatINR(orderData.totalRupees)}</strong></li>
                  <li>Copy or save the <strong>12-digit UTR / Transaction ID</strong> from your UPI app receipt.</li>
                  <li>Take a screenshot of the successful transaction screen.</li>
                  <li>Return to this page to upload the proof below.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Step 2: Payment Screenshot Upload ─────────────────────── */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE0D5] shadow-card space-y-6">
          <div className="border-b border-[#EAE0D5] pb-4">
            <h2 className="font-serif text-2xl text-[#452638]">Upload Your Payment Screenshot</h2>
            <p className="text-xs text-[#766E65] mt-1 leading-relaxed">
              After completing your UPI payment, upload a screenshot of the successful transaction and enter the UPI transaction reference. Your order will be verified before confirmation. Please do not upload screenshots containing unnecessary personal or financial information.
            </p>
          </div>

          {uploadSuccess ? (
            <div className="text-center py-8 space-y-4 bg-emerald-50/60 p-6 rounded-2xl border border-emerald-200">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl text-[#452638]">Payment Proof Submitted Successfully</h3>
              <div className="max-w-md mx-auto text-xs text-[#766E65] space-y-2 bg-white p-4 rounded-xl border border-emerald-200">
                <p>
                  <strong>Payment Status:</strong>{" "}
                  <span className="font-semibold text-amber-700 uppercase tracking-wider">
                    {orderData.paymentStatus === "PAID" ? "PAID & VERIFIED" : "AWAITING PAYMENT VERIFICATION"}
                  </span>
                </p>
                <p><strong>UTR Reference:</strong> <span className="font-mono text-[#452638] font-bold">{utr || orderData.transactionReference}</span></p>
                <p className="text-[11px] text-[#766E65]/90 pt-1">
                  We will confirm your order after verifying the transaction against our HDFC Bank merchant account statement. You can track this order anytime.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href={`/track-order?query=${encodeURIComponent(orderId)}`}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#452638] text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#5D354D] transition-colors"
                >
                  Track Order Status
                </Link>
                <button
                  type="button"
                  onClick={() => setUploadSuccess(false)}
                  className="w-full sm:w-auto px-6 py-2.5 border border-[#452638] text-[#452638] text-xs font-semibold uppercase rounded-full hover:bg-[#FAF6F0] transition-colors"
                >
                  Update / Replace Screenshot
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitProof} className="space-y-6">
              {uploadError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* UTR / Transaction Reference Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#452638]">
                  UTR / Transaction ID *
                </label>
                <input
                  type="text"
                  required
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.trim())}
                  placeholder="e.g. 412345678901 or UPI Ref Number"
                  className="w-full px-4 py-3 bg-white border border-[#EAE0D5] rounded-xl text-xs sm:text-sm text-[#452638] font-mono focus:outline-none focus:border-[#452638]"
                />
                <p className="text-[11px] text-[#766E65]">
                  Found in your GPay / PhonePe / Paytm transaction receipt as &quot;UPI Ref No.&quot; or &quot;UTR&quot;.
                </p>
              </div>

              {/* File Upload & Preview Section */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#452638]">
                  Payment Screenshot (JPG, JPEG, PNG • Max 5 MB) *
                </label>

                {previewUrl ? (
                  <div className="relative p-4 bg-[#FAF6F0] border-2 border-dashed border-[#B69A62] rounded-2xl flex flex-col items-center space-y-3">
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-3 right-3 p-1.5 bg-white text-red-600 rounded-full border border-red-200 hover:bg-red-50 shadow-xs"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="relative w-48 h-64 bg-white rounded-xl overflow-hidden border border-[#EAE0D5] shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Payment screenshot preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center text-xs text-[#766E65]">
                      <p className="font-semibold text-[#452638] truncate max-w-xs">{selectedFile?.name}</p>
                      <p className="text-[10px]">{((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer p-8 bg-[#FAF6F0]/50 hover:bg-[#FAF6F0] border-2 border-dashed border-[#EAE0D5] hover:border-[#B69A62] rounded-2xl text-center space-y-3 transition-colors"
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-[#B69A62] shadow-xs border border-[#EAE0D5]">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#452638]">
                        Click to select payment screenshot
                      </p>
                      <p className="text-[10px] text-[#766E65] mt-1">
                        Supports JPG, JPEG, PNG up to 5 MB
                      </p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-4 bg-[#452638] hover:bg-[#5D354D] text-white text-xs font-semibold uppercase tracking-luxury rounded-xl flex items-center justify-center space-x-2 transition-all shadow-sm disabled:opacity-70 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#B69A62]" />
                    <span>VERIFYING &amp; UPLOADING PROOF...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#B69A62]" />
                    <span>SUBMIT PAYMENT PROOF</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
