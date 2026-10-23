"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  User, 
  Package, 
  MapPin, 
  Settings, 
  LogOut, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Truck, 
  ChevronRight, 
  AlertCircle, 
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Building,
  Home,
  Briefcase,
  X,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { CustomerAddress, AddressType } from "@/lib/customer-types";
import { formatINR } from "@/lib/shipping";

type AccountTab = "overview" | "orders" | "addresses" | "profile";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"
];

function AccountDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as AccountTab) || "overview";

  const {
    customer,
    addresses,
    orders,
    isAuthenticated,
    isLoading,
    openAuthModal,
    logout,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
    updateProfile,
    refreshCustomerData
  } = useAuth();

  const [activeTab, setActiveTab] = useState<AccountTab>(initialTab);

  // Address modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [addressForm, setAddressForm] = useState({
    recipientName: "",
    deliveryPhone: "",
    houseNumber: "",
    buildingName: "",
    streetArea: "",
    landmark: "",
    city: "",
    state: "Tamil Nadu",
    postalCode: "",
    addressType: "home" as AddressType,
    deliveryInstructions: "",
    isDefault: false
  });
  const [addressError, setAddressError] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Order Details Modal state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Profile Form state
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get("tab") as AccountTab;
    if (tab && ["overview", "orders", "addresses", "profile"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Populate profile fields when customer loads
  useEffect(() => {
    if (customer) {
      setDisplayName(customer.displayName || "");
      setEmail(customer.email || "");
      setDeliveryPhone(customer.phoneNumber ? customer.phoneNumber.replace(/\D/g, "").slice(-10) : "");
    }
  }, [customer]);

  const switchTab = (tab: AccountTab) => {
    setActiveTab(tab);
    router.replace(`/account?tab=${tab}`, { scroll: false });
  };

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      recipientName: customer?.displayName || "",
      deliveryPhone: customer?.phoneNumber?.replace(/\D/g, "").slice(-10) || "",
      houseNumber: "",
      buildingName: "",
      streetArea: "",
      landmark: "",
      city: "",
      state: "Tamil Nadu",
      postalCode: "",
      addressType: "home",
      deliveryInstructions: "",
      isDefault: addresses.length === 0
    });
    setAddressError("");
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    // Parse house/building/street if stored combined
    const lines = addr.addressLine1.split(", ");
    setAddressForm({
      recipientName: addr.recipientName,
      deliveryPhone: addr.deliveryPhone,
      houseNumber: lines[0] || "",
      buildingName: lines[1] || "",
      streetArea: addr.addressLine2 || "",
      landmark: addr.landmark || "",
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      addressType: addr.addressType,
      deliveryInstructions: addr.deliveryInstructions || "",
      isDefault: addr.isDefault
    });
    setAddressError("");
    setAddressModalOpen(true);
  };

  const handleSaveAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError("");

    if (!addressForm.recipientName.trim()) {
      setAddressError("Please enter the recipient full name.");
      return;
    }

    const cleanPhone = addressForm.deliveryPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setAddressError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!addressForm.houseNumber.trim()) {
      setAddressError("Please enter house, flat, or floor details.");
      return;
    }

    if (!addressForm.streetArea.trim()) {
      setAddressError("Please enter street, road, or area name.");
      return;
    }

    if (!addressForm.city.trim()) {
      setAddressError("Please enter city or town.");
      return;
    }

    const cleanPin = addressForm.postalCode.replace(/\D/g, "");
    if (cleanPin.length !== 6) {
      setAddressError("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    setIsSavingAddress(true);
    try {
      const addressLine1 = [addressForm.houseNumber.trim(), addressForm.buildingName.trim()].filter(Boolean).join(", ");
      await saveAddress({
        ...(editingAddress ? { addressId: editingAddress.addressId } : {}),
        recipientName: addressForm.recipientName.trim(),
        deliveryPhone: cleanPhone,
        addressLine1,
        addressLine2: addressForm.streetArea.trim(),
        landmark: addressForm.landmark.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state,
        postalCode: cleanPin,
        addressType: addressForm.addressType,
        deliveryInstructions: addressForm.deliveryInstructions.trim(),
        isDefault: addressForm.isDefault
      });
      setAddressModalOpen(false);
    } catch (err: any) {
      setAddressError(err.message || "Failed to save address. Please try again.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddressConfirm = async (addressId: string) => {
    if (confirm("Are you sure you want to delete this delivery address?")) {
      try {
        await deleteAddress(addressId);
      } catch (err: any) {
        alert(err.message || "Failed to delete address.");
      }
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsUpdatingProfile(true);

    try {
      await updateProfile(displayName.trim(), deliveryPhone.trim() || undefined);
      setProfileMsg({ type: "success", text: "Profile details updated successfully." });
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Not authenticated view
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="py-20 md:py-32 bg-[#FBF8F3] min-h-screen">
        <div className="max-w-md mx-auto px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#E8C9C5]/40 text-[#452638] flex items-center justify-center mx-auto shadow-inner">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl text-[#452638]">Customer Sign In</h1>
            <p className="text-xs sm:text-sm text-[#766E65]">
              Sign in with your verified email address to view orders, manage delivery addresses, and track real-time shipments.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => openAuthModal()}
              className="w-full py-3.5 px-6 bg-[#452638] hover:bg-[#5D354D] text-white text-xs uppercase tracking-luxury font-semibold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-[#B69A62]" />
              <span>Sign In with Email Link</span>
            </button>
          </div>
          <p className="text-[11px] text-[#766E65]">
            Passwordless &amp; secure · No numeric OTP or password required · Zero SMS Fees
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="py-32 bg-[#FBF8F3] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#452638] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">
            Loading Customer Account...
          </p>
        </div>
      </div>
    );
  }

  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE0D5] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#452638] to-[#5D354D] text-white flex items-center justify-center text-xl font-bold tracking-wider shadow-md">
              {(customer?.displayName?.charAt(0) || customer?.email?.charAt(0) || "A").toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif text-2xl text-[#452638]">
                  {customer?.displayName ? `Hello, ${customer.displayName}` : "Hello, Aura Connoisseur"}
                </h1>
                <span className="inline-flex items-center text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" /> Email Verified
                </span>
              </div>
              <p className="text-xs text-[#766E65] mt-0.5">
                {customer?.email} {customer?.phoneNumber ? `• +91 ${customer.phoneNumber}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end md:self-auto">
            <button
              onClick={() => logout()}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Tabs & Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Nav */}
          <div className="lg:col-span-1 space-y-2">
            <div className="bg-white rounded-2xl border border-[#EAE0D5] p-2 shadow-xs space-y-1">
              <button
                onClick={() => switchTab("overview")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-medium transition-all ${
                  activeTab === "overview"
                    ? "bg-[#452638] text-white shadow-xs font-semibold"
                    : "text-[#452638] hover:bg-[#FBF8F3] hover:text-[#B69A62]"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Account Overview</span>
              </button>

              <button
                onClick={() => switchTab("orders")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-all ${
                  activeTab === "orders"
                    ? "bg-[#452638] text-white shadow-xs font-semibold"
                    : "text-[#452638] hover:bg-[#FBF8F3] hover:text-[#B69A62]"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Package className="w-4 h-4" />
                  <span>My Orders</span>
                </div>
                {orders.length > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === "orders" ? "bg-white/20 text-white" : "bg-[#FBF8F3] text-[#452638]"}`}>
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => switchTab("addresses")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-all ${
                  activeTab === "addresses"
                    ? "bg-[#452638] text-white shadow-xs font-semibold"
                    : "text-[#452638] hover:bg-[#FBF8F3] hover:text-[#B69A62]"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4" />
                  <span>My Addresses</span>
                </div>
                {addresses.length > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === "addresses" ? "bg-white/20 text-white" : "bg-[#FBF8F3] text-[#452638]"}`}>
                    {addresses.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => switchTab("profile")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-medium transition-all ${
                  activeTab === "profile"
                    ? "bg-[#452638] text-white shadow-xs font-semibold"
                    : "text-[#452638] hover:bg-[#FBF8F3] hover:text-[#B69A62]"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>My Profile</span>
              </button>
            </div>

            {/* Quick Support card */}
            <div className="bg-[#FAF3EE] rounded-2xl border border-[#E8C9C5] p-4 text-xs text-[#452638] space-y-2">
              <p className="font-semibold flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B69A62]" />
                <span>Concierge Support</span>
              </p>
              <p className="text-[11px] text-[#766E65]">
                Need help with your bespoke handcrafted candles or UPI verification?
              </p>
              <Link
                href="/contact"
                className="inline-block text-[11px] font-semibold text-[#452638] underline hover:text-[#B69A62]"
              >
                Contact Aura Care &rarr;
              </Link>
            </div>
          </div>

          {/* Main Tab Content */}
          <div className="lg:col-span-3 space-y-6">

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-[#EAE0D5] shadow-xs">
                    <div className="flex items-center justify-between text-[#766E65] text-xs">
                      <span>Total Orders</span>
                      <Package className="w-4 h-4 text-[#B69A62]" />
                    </div>
                    <div className="mt-3 text-2xl font-serif font-bold text-[#452638]">
                      {orders.length}
                    </div>
                    <button
                      onClick={() => switchTab("orders")}
                      className="text-[11px] text-[#B69A62] hover:underline mt-2 inline-flex items-center"
                    >
                      View all orders &rarr;
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#EAE0D5] shadow-xs">
                    <div className="flex items-center justify-between text-[#766E65] text-xs">
                      <span>Saved Addresses</span>
                      <MapPin className="w-4 h-4 text-[#B69A62]" />
                    </div>
                    <div className="mt-3 text-2xl font-serif font-bold text-[#452638]">
                      {addresses.length}
                    </div>
                    <button
                      onClick={() => switchTab("addresses")}
                      className="text-[11px] text-[#B69A62] hover:underline mt-2 inline-flex items-center"
                    >
                      Manage address book &rarr;
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#EAE0D5] shadow-xs">
                    <div className="flex items-center justify-between text-[#766E65] text-xs">
                      <span>Default Delivery Area</span>
                      <Home className="w-4 h-4 text-[#B69A62]" />
                    </div>
                    <div className="mt-3 text-sm font-semibold text-[#452638] truncate">
                      {defaultAddr ? `${defaultAddr.city}, ${defaultAddr.postalCode}` : "No address saved"}
                    </div>
                    <p className="text-[11px] text-[#766E65] mt-2 truncate">
                      {defaultAddr ? defaultAddr.recipientName : "Add an address for 1-click checkout"}
                    </p>
                  </div>
                </div>

                {/* Recent Orders section */}
                <div className="bg-white rounded-2xl border border-[#EAE0D5] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-lg text-[#452638]">Recent Orders</h2>
                      <p className="text-xs text-[#766E65]">Your most recent purchases and live order status</p>
                    </div>
                    {orders.length > 0 && (
                      <button
                        onClick={() => switchTab("orders")}
                        className="text-xs font-semibold text-[#B69A62] hover:underline"
                      >
                        View All ({orders.length})
                      </button>
                    )}
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-10 space-y-3">
                      <ShoppingBag className="w-10 h-10 text-[#E8C9C5] mx-auto" />
                      <p className="text-sm font-medium text-[#452638]">No orders placed yet</p>
                      <p className="text-xs text-[#766E65] max-w-sm mx-auto">
                        Explore our handcrafted soy scented candles, wax tablets, and resin casting decor.
                      </p>
                      <Link
                        href="/shop"
                        className="inline-block mt-2 px-5 py-2.5 bg-[#452638] text-white text-xs uppercase tracking-wider font-semibold rounded-xl hover:bg-[#5D354D]"
                      >
                        Discover Fragrances
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div
                          key={order.orderId}
                          className="p-4 rounded-xl border border-[#EAE0D5] hover:border-[#B69A62]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs font-bold text-[#452638]">{order.orderId}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                order.paymentStatus === "confirmed" ? "bg-emerald-50 text-emerald-700" :
                                order.paymentStatus === "under_review" ? "bg-amber-50 text-amber-700" :
                                "bg-rose-50 text-rose-700"
                              }`}>
                                {order.paymentStatus === "confirmed" ? "Payment Confirmed" :
                                 order.paymentStatus === "under_review" ? "Payment Review" : "Payment Pending"}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                                {order.fulfilmentStatus || "Order Placed"}
                              </span>
                            </div>
                            <p className="text-xs text-[#766E65]">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} • {order.items?.length || 0} items
                            </p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end space-x-4">
                            <span className="font-serif font-bold text-sm text-[#452638]">
                              {formatINR(order.totalAmount || (order.totalPaise ? order.totalPaise / 100 : 0))}
                            </span>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-3.5 py-1.5 text-xs font-semibold text-[#452638] border border-[#EAE0D5] hover:bg-[#FBF8F3] rounded-lg transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Default Address quick preview */}
                <div className="bg-white rounded-2xl border border-[#EAE0D5] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-lg text-[#452638]">Primary Delivery Address</h2>
                      <p className="text-xs text-[#766E65]">Selected automatically during checkout</p>
                    </div>
                    <button
                      onClick={() => switchTab("addresses")}
                      className="text-xs font-semibold text-[#B69A62] hover:underline"
                    >
                      Manage All
                    </button>
                  </div>

                  {defaultAddr ? (
                    <div className="p-4 rounded-xl border border-[#EAE0D5] bg-[#FBF8F3]/40 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#452638]">{defaultAddr.recipientName}</span>
                        <span className="text-[10px] uppercase tracking-wider bg-[#B69A62] text-white px-2 py-0.5 rounded-full font-semibold">
                          Default
                        </span>
                        <span className="text-[10px] uppercase tracking-wider bg-[#EAE0D5] text-[#452638] px-2 py-0.5 rounded-full font-medium">
                          {defaultAddr.addressType}
                        </span>
                      </div>
                      <p className="text-xs text-[#766E65] pt-1">
                        {defaultAddr.addressLine1}, {defaultAddr.addressLine2}
                      </p>
                      <p className="text-xs text-[#766E65]">
                        {defaultAddr.city}, {defaultAddr.state} — <span className="font-semibold text-[#452638]">{defaultAddr.postalCode}</span>
                      </p>
                      <p className="text-xs text-[#766E65]">Phone: +91 {defaultAddr.deliveryPhone}</p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <button
                        onClick={handleOpenAddAddress}
                        className="px-4 py-2 bg-[#452638] text-white text-xs font-semibold rounded-xl hover:bg-[#5D354D]"
                      >
                        + Add Delivery Address
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MY ORDERS */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-2xl border border-[#EAE0D5] p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h2 className="font-serif text-2xl text-[#452638]">Order History</h2>
                  <p className="text-xs text-[#766E65] mt-1">
                    Track your orders, view UPI payment verification details, and inspect invoices.
                  </p>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <Package className="w-12 h-12 text-[#E8C9C5] mx-auto" />
                    <p className="text-base font-medium text-[#452638]">No orders in your account yet</p>
                    <p className="text-xs text-[#766E65] max-w-sm mx-auto">
                      All your previous and current orders placed using this mobile number will appear here automatically.
                    </p>
                    <Link
                      href="/shop"
                      className="inline-block mt-2 px-6 py-3 bg-[#452638] text-white text-xs uppercase tracking-luxury font-semibold rounded-xl hover:bg-[#5D354D] shadow-sm"
                    >
                      Shop Collections
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const total = order.totalAmount || (order.totalPaise ? order.totalPaise / 100 : 0);
                      const isPaid = order.paymentStatus === "confirmed";
                      const isReview = order.paymentStatus === "under_review";

                      return (
                        <div
                          key={order.orderId}
                          className="rounded-2xl border border-[#EAE0D5] overflow-hidden hover:border-[#B69A62]/40 transition-shadow hover:shadow-xs"
                        >
                          {/* Order Header bar */}
                          <div className="bg-[#FAF7F2] p-4 border-b border-[#EAE0D5] flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex flex-wrap items-center gap-4">
                              <div>
                                <span className="text-[10px] uppercase text-[#766E65] block font-medium">Order Number</span>
                                <span className="font-mono font-bold text-[#452638]">{order.orderId}</span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase text-[#766E65] block font-medium">Order Date</span>
                                <span className="text-[#452638] font-medium">
                                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                  })}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase text-[#766E65] block font-medium">Total Amount</span>
                                <span className="font-serif font-bold text-[#452638]">{formatINR(total)}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {/* Payment status badge */}
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                isPaid ? "bg-emerald-100 text-emerald-800" :
                                isReview ? "bg-amber-100 text-amber-800" :
                                "bg-rose-100 text-rose-800"
                              }`}>
                                {isPaid ? "Payment Confirmed" : isReview ? "Payment Review" : "Payment Pending"}
                              </span>

                              {/* Fulfilment status badge */}
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-800">
                                {order.fulfilmentStatus || "Order Placed"}
                              </span>
                            </div>
                          </div>

                          {/* Order items body */}
                          <div className="p-4 sm:p-5 space-y-4">
                            <div className="space-y-3">
                              {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center space-x-3">
                                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#FAF7F2] border border-[#EAE0D5] flex-shrink-0">
                                    <Image
                                      src={item.image || "/images/products/rose-candle.png"}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-[#452638] truncate">{item.name}</p>
                                    <p className="text-[11px] text-[#766E65]">
                                      Qty: {item.quantity} {item.selectedWeight ? `• ${item.selectedWeight}` : ""} {item.selectedFragrance ? `• ${item.selectedFragrance}` : ""}
                                    </p>
                                    <p className="text-xs font-medium text-[#452638]">
                                      {formatINR(item.price || (item.pricePaise ? item.pricePaise / 100 : 0))}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Address snapshot summary */}
                            <div className="pt-3 border-t border-[#EAE0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                              <div className="text-[#766E65] flex items-center space-x-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#B69A62] flex-shrink-0" />
                                <span className="truncate">
                                  Delivering to: <strong className="text-[#452638]">{order.deliveryAddressSnapshot?.recipientName || order.shippingAddress?.fullName}</strong> ({order.deliveryAddressSnapshot?.city || order.shippingAddress?.city}, {order.deliveryAddressSnapshot?.postalCode || order.shippingAddress?.postalCode})
                                </span>
                              </div>

                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="px-4 py-2 bg-[#452638] hover:bg-[#5D354D] text-white text-xs font-semibold rounded-xl uppercase tracking-wider transition-colors self-start sm:self-auto"
                              >
                                View Order Details &amp; Status
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MY ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="bg-white rounded-2xl border border-[#EAE0D5] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl text-[#452638]">Saved Delivery Addresses</h2>
                    <p className="text-xs text-[#766E65] mt-1">
                      Manage your delivery destinations. Select any saved address effortlessly during checkout.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddAddress}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#452638] hover:bg-[#5D354D] text-white text-xs uppercase tracking-luxury font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12 space-y-3 border-2 border-dashed border-[#EAE0D5] rounded-2xl p-6">
                    <MapPin className="w-10 h-10 text-[#E8C9C5] mx-auto" />
                    <p className="text-sm font-medium text-[#452638]">No saved addresses found</p>
                    <p className="text-xs text-[#766E65] max-w-sm mx-auto">
                      Save your home, office, or gift delivery addresses for swift checkout.
                    </p>
                    <button
                      onClick={handleOpenAddAddress}
                      className="mt-2 px-5 py-2.5 bg-[#452638] text-white text-xs uppercase tracking-wider font-semibold rounded-xl hover:bg-[#5D354D]"
                    >
                      + Add First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.addressId}
                        className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                          addr.isDefault
                            ? "border-[#452638] bg-[#FBF8F3]/60 shadow-xs ring-1 ring-[#452638]/20"
                            : "border-[#EAE0D5] bg-white hover:border-[#B69A62]/40"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {addr.addressType === "home" && <Home className="w-4 h-4 text-[#B69A62]" />}
                              {addr.addressType === "work" && <Briefcase className="w-4 h-4 text-[#B69A62]" />}
                              {addr.addressType === "other" && <Building className="w-4 h-4 text-[#B69A62]" />}
                              <span className="text-xs font-bold uppercase tracking-wider text-[#452638]">
                                {addr.addressType}
                              </span>
                            </div>

                            {addr.isDefault && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#452638] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                                Default
                              </span>
                            )}
                          </div>

                          <div className="pt-1">
                            <p className="text-sm font-bold text-[#452638]">{addr.recipientName}</p>
                            <p className="text-xs text-[#766E65] mt-1 leading-relaxed">
                              {addr.addressLine1}
                              {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                              {addr.landmark ? `, Near ${addr.landmark}` : ""}
                            </p>
                            <p className="text-xs text-[#766E65] font-medium">
                              {addr.city}, {addr.state} — <strong className="text-[#452638]">{addr.postalCode}</strong>
                            </p>
                            <p className="text-xs text-[#766E65] mt-1">
                              Mobile: +91 {addr.deliveryPhone}
                            </p>
                            {addr.deliveryInstructions && (
                              <p className="text-[11px] text-[#B69A62] italic mt-1 bg-white/80 p-1.5 rounded-md border border-[#EAE0D5]">
                                Note: {addr.deliveryInstructions}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-4 mt-4 border-t border-[#EAE0D5]/80 flex items-center justify-between text-xs">
                          <div>
                            {!addr.isDefault && (
                              <button
                                onClick={() => setDefaultAddress(addr.addressId)}
                                className="text-[11px] font-semibold text-[#B69A62] hover:underline"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>

                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleOpenEditAddress(addr)}
                              className="text-xs text-[#452638] hover:text-[#B69A62] flex items-center space-x-1 font-medium"
                              title="Edit address"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeleteAddressConfirm(addr.addressId)}
                              className="text-xs text-rose-600 hover:text-rose-700 flex items-center space-x-1 font-medium"
                              title="Delete address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: MY PROFILE */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl border border-[#EAE0D5] p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h2 className="font-serif text-2xl text-[#452638]">Account Profile</h2>
                  <p className="text-xs text-[#766E65] mt-1">
                    Manage your verified customer details and communication preferences.
                  </p>
                </div>

                {profileMsg && (
                  <div
                    className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${
                      profileMsg.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {profileMsg.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    )}
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-lg">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#452638]">
                      Verified Email Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        disabled
                        value={customer?.email || ""}
                        className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EAE0D5] rounded-xl text-xs text-[#766E65] cursor-not-allowed font-medium"
                      />
                      <span className="inline-flex items-center text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-3 rounded-xl font-medium whitespace-nowrap">
                        <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" /> Email Verified
                      </span>
                    </div>
                    <p className="text-[10px] text-[#766E65]">
                      Your verified email address is your primary Aura account identifier.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#452638]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-4 py-3 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#452638]">
                      Delivery Contact Mobile (Optional)
                    </label>
                    <div className="flex">
                      <span className="px-3 py-3 bg-[#FAF7F2] border border-r-0 border-[#EAE0D5] rounded-l-xl text-xs text-[#766E65] font-semibold">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="10-digit mobile number"
                        className="w-full px-4 py-3 bg-white border border-[#EAE0D5] rounded-r-xl text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
                      />
                    </div>
                    <p className="text-[10px] text-[#766E65]">
                      Used by courier partners for dispatch notifications and order delivery coordination.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="px-6 py-3 bg-[#452638] hover:bg-[#5D354D] text-white text-xs uppercase tracking-luxury font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                    >
                      {isUpdatingProfile ? "Saving Changes..." : "Save Profile Details"}
                    </button>
                  </div>
                </form>

                {/* Account Metadata */}
                <div className="pt-6 border-t border-[#EAE0D5] space-y-2 text-xs text-[#766E65]">
                  <p>Account UID: <span className="font-mono text-[#452638]">{customer?.uid}</span></p>
                  {customer?.createdAt && (
                    <p>Member Since: {new Date(customer.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
                  )}
                  {customer?.lastLoginAt && (
                    <p>Last Active: {new Date(customer.lastLoginAt).toLocaleString("en-IN")}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADD / EDIT ADDRESS MODAL */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#EAE0D5] shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE0D5]">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-[#B69A62]" />
                <h3 className="font-serif text-xl text-[#452638]">
                  {editingAddress ? "Edit Delivery Address" : "Add New Delivery Address"}
                </h3>
              </div>
              <button
                onClick={() => setAddressModalOpen(false)}
                className="p-1.5 text-[#766E65] hover:text-[#452638] rounded-full hover:bg-[#FBF8F3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addressError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{addressError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddressSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#452638]">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.recipientName}
                    onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                    placeholder="Full Name"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#452638]">
                    Delivery Mobile *
                  </label>
                  <div className="flex">
                    <span className="px-3 py-2.5 bg-[#FAF7F2] border border-r-0 border-[#EAE0D5] rounded-l-xl text-xs text-[#766E65] font-semibold">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={addressForm.deliveryPhone}
                      onChange={(e) => setAddressForm({ ...addressForm, deliveryPhone: e.target.value.replace(/\D/g, "") })}
                      placeholder="10-digit mobile"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-r-xl text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#452638]">
                  Flat, House no., Building, Apartment *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.houseNumber}
                  onChange={(e) => setAddressForm({ ...addressForm, houseNumber: e.target.value })}
                  placeholder="e.g. Flat 402, Rosewood Heights"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#452638]">
                  Area, Street, Sector, Village *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.streetArea}
                  onChange={(e) => setAddressForm({ ...addressForm, streetArea: e.target.value })}
                  placeholder="e.g. 14th Main Road, Indiranagar"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#452638]">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    placeholder="e.g. Opposite Metro Pillar 120"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#452638]">
                    6-Digit PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value.replace(/\D/g, "") })}
                    placeholder="e.g. 560038"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#452638]">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="e.g. Bengaluru"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#452638]">
                    State *
                  </label>
                  <select
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#452638]">
                  Address Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["home", "work", "other"] as AddressType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, addressType: type })}
                      className={`py-2 px-3 rounded-xl border text-xs capitalize font-medium flex items-center justify-center space-x-1.5 transition-all ${
                        addressForm.addressType === type
                          ? "bg-[#452638] text-white border-[#452638] shadow-xs"
                          : "border-[#EAE0D5] text-[#766E65] hover:bg-[#FAF7F2]"
                      }`}
                    >
                      {type === "home" && <Home className="w-3.5 h-3.5" />}
                      {type === "work" && <Briefcase className="w-3.5 h-3.5" />}
                      {type === "other" && <Building className="w-3.5 h-3.5" />}
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#452638]">
                  Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={addressForm.deliveryInstructions}
                  onChange={(e) => setAddressForm({ ...addressForm, deliveryInstructions: e.target.value })}
                  placeholder="e.g. Ring bell twice / Leave at security"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
                />
              </div>

              <label className="flex items-center space-x-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 text-[#452638] rounded border-[#EAE0D5] focus:ring-[#452638]"
                />
                <span className="text-xs text-[#452638] font-medium">
                  Make this my default delivery address
                </span>
              </label>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2.5 border border-[#EAE0D5] text-xs font-semibold text-[#766E65] hover:bg-[#FAF7F2] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="px-6 py-2.5 bg-[#452638] hover:bg-[#5D354D] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSavingAddress ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#EAE0D5] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE0D5]">
              <div>
                <span className="text-[10px] uppercase tracking-luxury text-[#B69A62] font-semibold">Order Details</span>
                <h3 className="font-mono text-xl font-bold text-[#452638]">{selectedOrder.orderId}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-[#766E65] hover:text-[#452638] rounded-full hover:bg-[#FBF8F3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Timeline */}
            <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#EAE0D5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#452638]">Order Status</span>
                <span className="text-xs font-semibold text-[#B69A62]">
                  {selectedOrder.fulfilmentStatus || "Order Placed"}
                </span>
              </div>

              {/* Progress steps */}
              <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                <div className="space-y-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-[10px]">✓</div>
                  <p className="text-[10px] font-semibold text-[#452638]">Placed</p>
                </div>
                <div className="space-y-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-[10px] ${
                    selectedOrder.paymentStatus === "confirmed" ? "bg-emerald-600 text-white" : "bg-amber-100 text-amber-700"
                  }`}>
                    {selectedOrder.paymentStatus === "confirmed" ? "✓" : "•"}
                  </div>
                  <p className="text-[10px] font-semibold text-[#452638]">Payment</p>
                </div>
                <div className="space-y-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-[10px] ${
                    ["Shipped", "Out for Delivery", "Delivered"].includes(selectedOrder.fulfilmentStatus) ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    {["Shipped", "Out for Delivery", "Delivered"].includes(selectedOrder.fulfilmentStatus) ? "✓" : "3"}
                  </div>
                  <p className="text-[10px] font-semibold text-[#452638]">Dispatched</p>
                </div>
                <div className="space-y-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-[10px] ${
                    selectedOrder.fulfilmentStatus === "Delivered" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    {selectedOrder.fulfilmentStatus === "Delivered" ? "✓" : "4"}
                  </div>
                  <p className="text-[10px] font-semibold text-[#452638]">Delivered</p>
                </div>
              </div>
            </div>

            {/* UPI Payment Verification Details */}
            <div className="rounded-2xl p-5 border border-[#EAE0D5] space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#452638]">Direct HDFC UPI Verification</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#766E65] block">Payment Method:</span>
                  <span className="font-semibold text-[#452638]">Direct UPI (dharanidft-1@okhdfcbank)</span>
                </div>
                <div>
                  <span className="text-[#766E65] block">Payment Verification:</span>
                  <span className={`font-semibold ${
                    selectedOrder.paymentStatus === "confirmed" ? "text-emerald-700" :
                    selectedOrder.paymentStatus === "under_review" ? "text-amber-700" : "text-rose-700"
                  }`}>
                    {selectedOrder.paymentStatus === "confirmed" ? "Verified & Confirmed" :
                     selectedOrder.paymentStatus === "under_review" ? "Screenshot Under Admin Verification" : "Pending Verification"}
                  </span>
                </div>
                {selectedOrder.customerUtr && (
                  <div className="col-span-2 pt-1">
                    <span className="text-[#766E65] block">Customer UPI UTR / Reference:</span>
                    <span className="font-mono font-bold text-[#452638]">{selectedOrder.customerUtr}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#452638]">Ordered Fragrances &amp; Decor</h4>
              <div className="space-y-2 divide-y divide-[#EAE0D5]">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="pt-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-[#452638]">{item.name}</p>
                      <p className="text-[11px] text-[#766E65]">
                        Qty: {item.quantity} {item.selectedWeight ? `• ${item.selectedWeight}` : ""} {item.selectedFragrance ? `• ${item.selectedFragrance}` : ""}
                      </p>
                    </div>
                    <span className="font-serif font-bold text-[#452638]">
                      {formatINR(item.price || (item.pricePaise ? item.pricePaise / 100 : 0))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address snapshot */}
            <div className="rounded-2xl p-4 bg-[#FAF7F2] border border-[#EAE0D5] text-xs space-y-1">
              <h4 className="font-bold text-[#452638] uppercase tracking-wider text-[11px]">Delivery Address Used (Historical Snapshot)</h4>
              <p className="font-semibold text-[#452638]">
                {selectedOrder.deliveryAddressSnapshot?.recipientName || selectedOrder.shippingAddress?.fullName}
              </p>
              <p className="text-[#766E65]">
                {selectedOrder.deliveryAddressSnapshot?.addressLine1 || selectedOrder.shippingAddress?.addressLine1},{" "}
                {selectedOrder.deliveryAddressSnapshot?.addressLine2 || selectedOrder.shippingAddress?.addressLine2}
              </p>
              <p className="text-[#766E65]">
                {selectedOrder.deliveryAddressSnapshot?.city || selectedOrder.shippingAddress?.city},{" "}
                {selectedOrder.deliveryAddressSnapshot?.state || selectedOrder.shippingAddress?.state} —{" "}
                <strong className="text-[#452638]">{selectedOrder.deliveryAddressSnapshot?.postalCode || selectedOrder.shippingAddress?.postalCode}</strong>
              </p>
              <p className="text-[#766E65]">
                Mobile: +91 {selectedOrder.deliveryAddressSnapshot?.deliveryPhone || selectedOrder.shippingAddress?.phone}
              </p>
            </div>

            {/* Total breakdown */}
            <div className="pt-3 border-t border-[#EAE0D5] flex items-center justify-between text-sm">
              <span className="font-bold text-[#452638]">Total Amount Paid</span>
              <span className="font-serif font-bold text-lg text-[#452638]">
                {formatINR(selectedOrder.totalAmount || (selectedOrder.totalPaise ? selectedOrder.totalPaise / 100 : 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="py-32 bg-[#FBF8F3] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#452638] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">
            Loading Customer Account...
          </p>
        </div>
      </div>
    }>
      <AccountDashboardContent />
    </Suspense>
  );
}
