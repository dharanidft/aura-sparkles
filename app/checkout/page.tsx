"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Banknote, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  Loader2,
  MapPin,
  Plus,
  Home,
  Briefcase,
  Building,
  User,
  MessageSquare
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { 
  formatINR, 
  checkIndianPincode, 
  INDIAN_STATES_AND_UTS, 
  FREE_SHIPPING_THRESHOLD 
} from "@/lib/shipping";
import { ShippingAddress, Order } from "@/lib/types";
import { saveOrderToStorage } from "@/lib/orders";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    discount,
    shippingFee,
    finalTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  const {
    customer,
    addresses,
    isAuthenticated,
    openAuthModal,
    saveAddress
  } = useAuth();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  // Requirement 5: Start with empty "Select state" placeholder
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "COD">("UPI");
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Address population helper
  const applyAddress = (addr: any) => {
    setFullName(addr.recipientName);
    setPhone(addr.deliveryPhone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || "");
    setLandmark(addr.landmark || "");
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.postalCode);
  };

  // Pre-fill or select default address when customer is loaded
  useEffect(() => {
    if (isAuthenticated && addresses.length > 0 && !selectedAddressId && !useNewAddress) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      if (def) {
        setSelectedAddressId(def.addressId);
        applyAddress(def);
      }
    } else if (isAuthenticated && customer && !fullName && !phone) {
      if (customer.displayName) setFullName(customer.displayName);
      if (customer.phoneNumber) setPhone(customer.phoneNumber.replace(/\D/g, "").slice(-10));
      if (customer.email) setEmail(customer.email);
    }
  }, [isAuthenticated, addresses, customer, selectedAddressId, useNewAddress]);

  // PIN-code lookup states
  const [isLookingUpPin, setIsLookingUpPin] = useState(false);
  const [pinLookupMessage, setPinLookupMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [availableLocalities, setAvailableLocalities] = useState<string[]>([]);
  const [selectedLocality, setSelectedLocality] = useState<string>("");
  const [userHasEditedCityOrState, setUserHasEditedCityOrState] = useState(false);
  const lookupSeqRef = useRef<number>(0);

  useEffect(() => {
    document.title = "Checkout — Aura Sparkles";
  }, []);

  // Handle 6-digit Indian PIN code input with async backend lookup
  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(raw);
    setPinLookupMessage(null);
    setAvailableLocalities([]);
    setSelectedLocality("");

    if (raw.length === 6) {
      if (raw.startsWith("0")) {
        setPinLookupMessage({
          text: "Indian postal PIN codes do not begin with 0. Please verify.",
          isError: true,
        });
        return;
      }

      const seq = ++lookupSeqRef.current;
      setIsLookingUpPin(true);

      try {
        const res = await fetch(`/api/pincode/${raw}`);
        const data = await res.json();

        // Stale response guard: discard if customer changed input since
        if (seq !== lookupSeqRef.current) return;

        if (data.success) {
          // Only auto-populate city & state if customer hasn't explicitly customized them
          if (!userHasEditedCityOrState || !city) {
            if (data.city) setCity(data.city);
          }
          if (!userHasEditedCityOrState || !state) {
            if (data.state) setState(data.state);
          }

          if (Array.isArray(data.localities) && data.localities.length > 1) {
            setAvailableLocalities(data.localities);
          }

          setPinLookupMessage({
            text: `PIN code located (${data.city || ""}, ${data.state || ""}). Final carrier serviceability confirmed at dispatch.`,
            isError: false,
          });
        } else {
          setPinLookupMessage({
            text: data.message || "PIN lookup inconclusive. Please enter your city and select your state manually.",
            isError: false,
          });
        }
      } catch (err) {
        if (seq === lookupSeqRef.current) {
          setPinLookupMessage({
            text: "Instant lookup unavailable. You can enter your city and state manually.",
            isError: false,
          });
        }
      } finally {
        if (seq === lookupSeqRef.current) {
          setIsLookingUpPin(false);
        }
      }
    }
  };

  const handleLocalitySelect = (loc: string) => {
    setSelectedLocality(loc);
    if (loc && !landmark) {
      setLandmark(loc);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput("");
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    // Login requirement check (Section 7)
    if (!isAuthenticated) {
      openAuthModal();
      setErrorMessage("Please sign in with your email link to place your order and track live shipments.");
      return;
    }

    // Phone validation (10 digits starting with 6-9)
    const phoneClean = phone.trim().replace(/\D/g, "");
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneClean)) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).");
      return;
    }

    // PIN code validation: must be 6 digits and not start with 0
    const pinClean = pincode.trim().replace(/\D/g, "");
    if (pinClean.length !== 6 || pinClean.startsWith("0")) {
      setErrorMessage("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    // State selection validation: must not be empty placeholder
    if (!state.trim()) {
      setErrorMessage("Please select your state or union territory from the dropdown.");
      return;
    }

    // City validation
    if (!city.trim()) {
      setErrorMessage("Please enter your city.");
      return;
    }

    setIsProcessing(true);

    const shippingAddress: ShippingAddress = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phoneClean,
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim(),
      landmark: landmark.trim() || selectedLocality || undefined,
      city: city.trim(),
      state: state.trim(),
      pincode: pinClean,
    };

    const deliveryAddressSnapshot = {
      recipientName: fullName.trim(),
      deliveryPhone: phoneClean,
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || "",
      landmark: landmark.trim() || selectedLocality || "",
      city: city.trim(),
      state: state.trim(),
      postalCode: pinClean,
      addressType: "Home" as const,
      isDefault: addresses.length === 0
    };

    // If new address entered and checkbox checked, save to customer account
    if (saveAddressToAccount && (!selectedAddressId || useNewAddress)) {
      try {
        await saveAddress(deliveryAddressSnapshot);
      } catch (e) {
        console.warn("Could not auto-save address to account", e);
      }
    }

    try {
      if (paymentMethod === "UPI") {
        // Direct HDFC Bank UPI Checkout flow
        const createRes = await fetch("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            couponCode: appliedCoupon?.code,
            shippingAddress,
            customerUid: customer?.uid,
            deliveryAddressSnapshot,
          }),
        });

        const orderData = await createRes.json();
        if (!createRes.ok || !orderData.success) {
          throw new Error(orderData.error || "Failed to create UPI order.");
        }

        // Save order locally for browser tracking backup
        const clientOrder: Order = {
          id: orderData.orderId,
          createdAt: new Date().toISOString(),
          items: [...items],
          subtotal,
          discount,
          discountCode: appliedCoupon?.code,
          shippingFee,
          total: orderData.totalRupees || finalTotal,
          shippingAddress,
          paymentMethod: "UPI",
          paymentStatus: "Pending",
          orderStatus: "Pending",
        };
        saveOrderToStorage(clientOrder);

        // Clear cart and redirect directly to UPI Payment Page
        clearCart();
        router.push(orderData.paymentUrl || `/pay/${orderData.orderId}?key=${orderData.accessKey}`);
        return;
      }

      // Cash on Delivery Fallback
      if (paymentMethod === "COD") {
        const createRes = await fetch("/api/checkout/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            couponCode: appliedCoupon?.code,
            shippingAddress,
            paymentMethod: "COD",
          }),
        });

        const orderData = await createRes.json();
        if (!createRes.ok || !orderData.success) {
          throw new Error(orderData.error || "Failed to create order.");
        }

        const completeOrder: Order = {
          id: orderData.orderId,
          createdAt: new Date().toISOString(),
          items: [...items],
          subtotal,
          discount,
          discountCode: appliedCoupon?.code,
          shippingFee,
          total: finalTotal,
          shippingAddress,
          paymentMethod: "COD",
          paymentStatus: "COD",
          orderStatus: "Confirmed",
          trackingNumber: `EXP-IN-${Date.now().toString().slice(-6)}`,
          estimatedDeliveryDate: checkIndianPincode(pinClean).deliveryDateStr,
        };

        saveOrderToStorage(completeOrder);
        clearCart();
        router.push(`/order-success/${completeOrder.id}`);
        return;
      }
    } catch (err: any) {
      console.error("Checkout process error", err);
      setErrorMessage(err.message || "An unexpected error occurred during checkout.");
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center bg-white min-h-screen">
        <div className="max-w-md mx-auto p-8 bg-white rounded-2xl border border-[#EAE0D5] space-y-4 shadow-sm">
          <p className="font-serif text-2xl text-[#452638]">Your shopping bag is empty</p>
          <p className="text-xs text-[#766E65]">Please add items to your cart before proceeding to checkout.</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 bg-[#452638] text-white text-xs uppercase tracking-luxury rounded-full hover:bg-[#5D354D]"
          >
            Explore Catalogue
          </Link>
        </div>
      </div>
    );
  }

  const statesOnly = INDIAN_STATES_AND_UTS.filter((s) => s.type === "state");
  const utOnly = INDIAN_STATES_AND_UTS.filter((s) => s.type === "ut");

  return (
    <div className="py-10 md:py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/shop"
          className="inline-flex items-center space-x-1.5 text-xs text-[#766E65] hover:text-[#452638] mb-8 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>

        <h1 className="font-serif text-3xl sm:text-4xl text-[#452638] font-normal tracking-tight mb-8">
          Checkout &amp; Delivery
        </h1>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left 7 Cols: Address & Payment Methods */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Delivery Address */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE0D5] shadow-subtle space-y-5">
                <div className="flex items-center justify-between border-b border-[#EAE0D5] pb-3">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-[#B69A62]" />
                    <h2 className="font-serif text-xl font-medium text-[#452638]">
                      1. Shipping Information
                    </h2>
                  </div>

                  {isAuthenticated && (
                    <span className="text-xs text-[#766E65] flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-[#B69A62]" />
                      <span>{customer?.displayName || customer?.email}</span>
                    </span>
                  )}
                </div>

                {/* Unauthenticated Visitor Prompt */}
                {!isAuthenticated && (
                  <div className="bg-[#FAF3EE] rounded-2xl p-4 sm:p-5 border border-[#E8C9C5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-serif text-base font-semibold text-[#452638]">Returning Customer?</h3>
                      </div>
                      <p className="text-xs text-[#766E65]">
                        Sign in via WhatsApp OTP to auto-fill saved addresses and track live orders.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openAuthModal()}
                      className="min-h-[44px] px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition-all whitespace-nowrap shadow-xs active:scale-[0.99] flex items-center justify-center space-x-2"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Sign In with WhatsApp</span>
                    </button>
                  </div>
                )}

                {/* Saved Address Cards for Authenticated Customers */}
                {isAuthenticated && addresses.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#452638]">
                        Select Saved Delivery Address
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !useNewAddress;
                          setUseNewAddress(nextState);
                          if (nextState) {
                            setSelectedAddressId(null);
                            setAddressLine1("");
                            setAddressLine2("");
                            setLandmark("");
                            setCity("");
                            setState("");
                            setPincode("");
                          } else {
                            const def = addresses.find((a) => a.isDefault) || addresses[0];
                            if (def) {
                              setSelectedAddressId(def.addressId);
                              applyAddress(def);
                            }
                          }
                        }}
                        className="text-xs font-semibold text-[#B69A62] hover:underline"
                      >
                        {useNewAddress ? "← Choose from Saved Addresses" : "+ Deliver to a New Address"}
                      </button>
                    </div>

                    {!useNewAddress && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {addresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.addressId;
                          return (
                            <div
                              key={addr.addressId}
                              onClick={() => {
                                setSelectedAddressId(addr.addressId);
                                applyAddress(addr);
                              }}
                              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                isSelected
                                  ? "border-[#452638] bg-[#FBF8F3] shadow-xs ring-1 ring-[#452638]"
                                  : "border-[#EAE0D5] bg-white hover:border-[#B69A62]/40"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name="selectedSavedAddress"
                                    checked={isSelected}
                                    onChange={() => {
                                      setSelectedAddressId(addr.addressId);
                                      applyAddress(addr);
                                    }}
                                    className="text-[#452638] focus:ring-[#452638]"
                                  />
                                  <span className="text-xs font-bold text-[#452638]">{addr.recipientName}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {addr.isDefault && (
                                    <span className="text-[9px] uppercase tracking-wider bg-[#452638] text-white px-2 py-0.5 rounded-full font-bold">
                                      Default
                                    </span>
                                  )}
                                  <span className="text-[9px] uppercase tracking-wider bg-[#EAE0D5] text-[#452638] px-2 py-0.5 rounded-full font-medium">
                                    {addr.addressType}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-[#766E65] mt-2 leading-relaxed">
                                {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ""}
                                {addr.city}, {addr.state} — <strong className="text-[#452638]">{addr.postalCode}</strong>
                              </p>
                              <p className="text-[11px] text-[#766E65] mt-1">Mobile: +91 {addr.deliveryPhone}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Form Inputs (Visible when using new address or no saved addresses) */}
                <div className={`space-y-4 ${isAuthenticated && addresses.length > 0 && !useNewAddress ? "hidden" : "block"}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#452638] mb-1">
                        Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Radhika Verma"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#452638] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. radhika@example.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#452638] mb-1">
                      Mobile Number (+91) *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#452638] mb-1">
                      House / Flat / Block No. &amp; Street *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="e.g. Flat 402, Golden Palms Residency"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#452638] mb-1">
                      Area / Locality / Landmark
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near Rose Garden"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                    />
                  </div>

                  {/* PIN Code Input with Status indicator */}
                  <div>
                    <label className="block text-xs font-medium text-[#452638] mb-1">
                      6-Digit PIN Code *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={pincode}
                        onChange={handlePincodeChange}
                        placeholder="e.g. 560038"
                        className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638] pr-8"
                      />
                      {isLookingUpPin && (
                        <div className="absolute right-2.5 top-2.5 text-[#B69A62] animate-spin">
                          <Loader2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-medium text-[#452638] mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setUserHasEditedCityOrState(true);
                      }}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                    />
                  </div>

                  {/* Locality dropdown when multiple results returned */}
                  {availableLocalities.length > 1 && (
                    <div className="sm:col-span-2 p-3 bg-[#FAF7F2] border border-[#EAE0D5] rounded-xl text-xs space-y-1.5 animate-fadeIn">
                      <label className="block font-medium text-[#452638] text-[11px]">
                        Select Your Area / Locality ({availableLocalities.length} options found):
                      </label>
                      <select
                        value={selectedLocality}
                        onChange={(e) => handleLocalitySelect(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#EAE0D5] rounded-lg text-xs text-[#452638] focus:outline-none focus:border-[#452638]"
                      >
                        <option value="">Choose your neighborhood...</option>
                        {availableLocalities.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-[#766E65]">
                        Selecting your locality helps our delivery partners locate your address faster.
                      </p>
                    </div>
                  )}

                  {/* PIN Code Lookup Message Banner */}
                  {pinLookupMessage && (
                    <div
                      className={`sm:col-span-2 p-2.5 rounded-lg text-xs flex items-start space-x-2 ${
                        pinLookupMessage.isError
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-900 border border-amber-200"
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span className="text-[11px] leading-snug">{pinLookupMessage.text}</span>
                    </div>
                  )}

                  {/* State Select: Empty placeholder + All 28 States & 8 Union Territories */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#452638] mb-1">
                      State / Union Territory *
                    </label>
                    <select
                      required
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        setUserHasEditedCityOrState(true);
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638] text-[#282522]"
                    >
                      <option value="" disabled>
                        Select state or union territory *
                      </option>
                      <optgroup label="States (28)">
                        {statesOnly.map((st) => (
                          <option key={st.code} value={st.name}>
                            {st.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Union Territories (8)">
                        {utOnly.map((ut) => (
                          <option key={ut.code} value={ut.name}>
                            {ut.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Save address to account checkbox */}
                  {isAuthenticated && (
                    <div className="sm:col-span-2 pt-1">
                      <label className="flex items-center space-x-2 text-xs text-[#452638] font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveAddressToAccount}
                          onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                          className="w-4 h-4 text-[#452638] rounded border-[#EAE0D5] focus:ring-[#452638]"
                        />
                        <span>Save this address to my Aura account address book</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected address review when card is picked */}
              {isAuthenticated && addresses.length > 0 && !useNewAddress && selectedAddressId && (
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE0D5] text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[#452638]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Delivering to <strong>{fullName}</strong> ({city}, {pincode})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUseNewAddress(true);
                      setSelectedAddressId(null);
                    }}
                    className="text-[#B69A62] font-semibold hover:underline text-[11px]"
                  >
                    Edit / Change
                  </button>
                </div>
              )}
            </div>

              {/* Payment Method */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE0D5] shadow-subtle space-y-5">
                <div className="flex items-center space-x-2 border-b border-[#EAE0D5] pb-3">
                  <CreditCard className="w-5 h-5 text-[#B69A62]" />
                  <h2 className="font-serif text-xl font-medium text-[#452638]">
                    2. Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* Direct UPI Payment Option */}
                  <label
                    className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "UPI"
                        ? "border-[#452638] bg-white ring-1 ring-[#452638]/20 shadow-xs"
                        : "border-[#EAE0D5] bg-white hover:border-[#B69A62]"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "UPI"}
                        onChange={() => setPaymentMethod("UPI")}
                        className="mt-1 text-[#452638] focus:ring-[#452638]"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-semibold text-[#452638]">
                            Direct UPI Payment (GPay, PhonePe, Paytm, BHIM)
                          </p>
                          <span className="px-2 py-0.5 rounded-full bg-[#B69A62]/15 text-[#452638] text-[10px] font-medium tracking-wide">
                            Recommended
                          </span>
                        </div>
                        <p className="text-[11px] text-[#766E65] mt-1 leading-relaxed">
                          Pay directly to our official HDFC Bank UPI ID or scan QR code. Upload payment screenshot &amp; UTR to submit for verification.
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end space-y-1 flex-shrink-0">
                      <div className="flex space-x-1">
                        <span className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-[#452638]">
                          GPay
                        </span>
                        <span className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-[#452638]">
                          PhonePe
                        </span>
                        <span className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-[#452638]">
                          Paytm
                        </span>
                      </div>
                      <span className="text-[9px] font-medium text-[#B69A62]">
                        HDFC Bank UPI
                      </span>
                    </div>
                  </label>

                  {/* Cash on Delivery Option */}
                  <label
                    className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "COD"
                        ? "border-[#452638] bg-white ring-1 ring-[#452638]/20 shadow-xs"
                        : "border-[#EAE0D5] bg-white hover:border-[#B69A62]"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="mt-1 text-[#452638] focus:ring-[#452638]"
                      />
                      <div>
                        <p className="text-xs font-semibold text-[#452638]">
                          Cash on Delivery (COD)
                        </p>
                        <p className="text-[11px] text-[#766E65] mt-0.5">
                          Pay cash to the delivery courier upon arrival at your doorstep.
                        </p>
                      </div>
                    </div>
                    <Banknote className="w-5 h-5 text-[#B69A62] flex-shrink-0" />
                  </label>
                </div>

                {/* Gateway note */}
                <div className="p-3 bg-white rounded-xl border border-[#EAE0D5] flex items-center space-x-2 text-[11px] text-[#766E65]">
                  <ShieldCheck className="w-4 h-4 text-[#B69A62] flex-shrink-0" />
                  <span>
                    Direct UPI transactions are verified before dispatch. No third-party gateway charges.
                  </span>
                </div>
              </div>

            </div>

            {/* Right 5 Cols: Order Summary & Review */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE0D5] shadow-subtle space-y-5">
                <h2 className="font-serif text-xl font-medium text-[#452638] border-b border-[#EAE0D5] pb-3">
                  Order Summary ({items.reduce((a, b) => a + b.quantity, 0)} items)
                </h2>

                {/* Item List */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center space-x-3 text-xs">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-[#EAE0D5] p-1">
                        <Image
                          src={item.product.images[0] || "/images/logo.png"}
                          alt={item.product.name}
                          fill
                          className="object-contain p-0.5"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-medium text-[#452638] truncate text-sm">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-[#766E65]">
                          Qty: {item.quantity} · {item.product.netWeight.split("/")[0]}
                        </p>
                      </div>
                      <span className="font-semibold text-[#452638]">
                        {formatINR(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <div className="pt-3 border-t border-[#EAE0D5]">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-[#F2E9DF] rounded-lg text-xs text-[#452638]">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-3.5 h-3.5 text-[#B69A62]" />
                        <span className="font-semibold uppercase">{appliedCoupon.code}</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Coupon code (e.g. AURA10)"
                        className="flex-1 px-3 py-2 bg-white border border-[#EAE0D5] rounded-lg text-xs uppercase focus:outline-none focus:border-[#452638]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-[#F2E9DF] hover:bg-[#E8C9C5] text-[#452638] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
                </div>

                {/* Amount breakdown */}
                <div className="space-y-2 text-xs text-[#766E65] pt-3 border-t border-[#EAE0D5]">
                  <div className="flex justify-between">
                    <span>Merchandise Subtotal</span>
                    <span className="text-[#452638] font-medium">{formatINR(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount</span>
                      <span>-{formatINR(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span>{shippingFee === 0 ? "Free" : formatINR(shippingFee)}</span>
                  </div>
                  <p className="text-[10px] text-[#766E65]/80">
                    Free shipping on orders ₹499 and above.
                  </p>
                  <div className="flex justify-between text-base font-semibold text-[#452638] pt-2 border-t border-[#EAE0D5]">
                    <span>Total Payable</span>
                    <span className="font-serif text-xl">{formatINR(finalTotal)}</span>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Order CTA */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#452638] hover:bg-[#5D354D] text-[#FAF7F2] text-xs font-semibold tracking-luxury uppercase rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-[#B69A62]" />
                  <span>
                    {isProcessing
                      ? "Processing Secure Order..."
                      : `CONFIRM ORDER (${formatINR(finalTotal)})`}
                  </span>
                </button>

                <p className="text-center text-[10px] text-[#766E65]">
                  By confirming, you agree to Aura Sparkles terms of service &amp; privacy policy.
                </p>
              </div>

            </div>

          </div>
        </form>

      </div>
    </div>
  );
}
