"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Lock, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  Download, 
  Search, 
  Edit, 
  Plus, 
  CheckCircle, 
  AlertTriangle,
  Tag, 
  Settings,
  Eye,
  LogOut,
  Save,
  X,
  Upload,
  Trash2,
  Type,
  ImageIcon,
  Sparkles,
  RefreshCw,
  Check,
  ExternalLink,
  ChevronRight,
  KeyRound,
  ShieldCheck,
  CreditCard,
  Copy,
  CheckCircle2,
  FileText,
  QrCode
} from "lucide-react";
import { getAllOrders, updateOrderStatusInStorage } from "@/lib/orders";
import { 
  INITIAL_PRODUCTS, 
  AVAILABLE_COUPONS, 
  getStoreProducts, 
  saveStoreProducts, 
  resetStoreProducts 
} from "@/lib/products-data";
import { Order, Product, OrderStatus, DiscountCoupon, ProductCategory, FragranceFamily } from "@/lib/types";
import { StoredOrder, OrderPaymentStatus } from "@/lib/upi-types";
import { formatINR } from "@/lib/shipping";
import { AuraFont, FONT_MAP, FONT_LIST } from "@/components/Header";

const DEFAULT_ADMIN_PASSCODE = "aura2026";

const getAdminPasscode = (): string => {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem("aura_admin_passcode");
    if (custom && custom.trim().length > 0) return custom.trim();
  }
  return process.env.NEXT_PUBLIC_ADMIN_PASSCODE || DEFAULT_ADMIN_PASSCODE;
};

const SAMPLE_PRESET_IMAGES = [
  { label: "Sandalwood Jar", url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80" },
  { label: "Rose Candle", url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80" },
  { label: "Vanilla Amber", url: "https://images.unsplash.com/photo-1596433809252-260c2745dfdd?auto=format&fit=crop&w=800&q=80" },
  { label: "Frosted Glass Glow", url: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80" },
  { label: "Gift Set Box", url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80" },
  { label: "Aura Sparkles Logo", url: "/images/logo.png" },
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"orders" | "upi" | "products" | "coupons" | "settings">("upi");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [coupons, setCoupons] = useState<DiscountCoupon[]>(AVAILABLE_COUPONS);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("All");

  // UPI Payment Verification State
  const [storedOrders, setStoredOrders] = useState<StoredOrder[]>([]);
  const [upiSearch, setUpiSearch] = useState("");
  const [upiStatusFilter, setUpiStatusFilter] = useState<string>("All");
  const [selectedOrderForVerification, setSelectedOrderForVerification] = useState<StoredOrder | null>(null);
  const [verificationNoteInput, setVerificationNoteInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  // Font Management
  const [activeFont, setActiveFont] = useState<AuraFont>("playfair");

  // Passcode management state
  const [currentPasscodeAttempt, setCurrentPasscodeAttempt] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [passcodeMsg, setPasscodeMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hasCustomPasscode, setHasCustomPasscode] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Product edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editImageUrlInput, setEditImageUrlInput] = useState("");
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // New product form state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdTagline, setNewProdTagline] = useState("Handcrafted Indian home-fragrance formulation");
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>("Scented Candles");
  const [newProdFragrance, setNewProdFragrance] = useState<FragranceFamily>("Floral & Romantic");
  const [newProdPrice, setNewProdPrice] = useState(299);
  const [newProdMrp, setNewProdMrp] = useState(399);
  const [newProdStock, setNewProdStock] = useState(50);
  const [newProdNetWeight, setNewProdNetWeight] = useState("100ml / 75g soy wax");
  const [newProdBurnTime, setNewProdBurnTime] = useState("22–25 Hours");
  const [newProdDescription, setNewProdDescription] = useState("Exquisite hand-poured aroma designed to cast a tranquil glow over your space.");
  const [newProdImages, setNewProdImages] = useState<string[]>([]);
  const [newProdImageUrlInput, setNewProdImageUrlInput] = useState("");
  const addFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const isAuth = sessionStorage.getItem("aura_admin_auth") === "true";
    if (isAuth) {
      setIsAuthenticated(true);
      loadAdminData();
    }
    const savedFont = (localStorage.getItem("aura_font") as AuraFont) || "playfair";
    if (FONT_MAP[savedFont]) {
      setActiveFont(savedFont);
    }
    setHasCustomPasscode(!!localStorage.getItem("aura_admin_passcode"));
  }, []);

  const fetchStoredOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-passcode": getAdminPasscode() },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          setStoredOrders(data.orders);
        }
      }
    } catch (err) {
      console.error("Failed to load stored orders", err);
    }
  };

  const loadAdminData = () => {
    setOrders(getAllOrders());
    setProducts(getStoreProducts());
    fetchStoredOrders();
  };

  const handleUpdatePaymentStatus = async (
    orderId: string,
    newStatus: OrderPaymentStatus,
    note?: string
  ) => {
    const confirmationText = 
      newStatus === "PAID" 
        ? `Are you sure you want to mark order ${orderId} as PAID? Confirm that you have independently verified the credit in your HDFC Bank account statement.`
        : newStatus === "PAYMENT_REJECTED"
        ? `Are you sure you want to REJECT payment proof for order ${orderId}? The customer will be able to resubmit a valid screenshot.`
        : `Change payment status of ${orderId} to ${newStatus}?`;

    if (!window.confirm(confirmationText)) return;

    setIsVerifying(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passcode": getAdminPasscode(),
        },
        body: JSON.stringify({
          orderId,
          newPaymentStatus: newStatus,
          verificationNote: note !== undefined ? note : verificationNoteInput.trim(),
          adminName: "Authorized Admin",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update payment status.");
      }

      showToast(`Order ${orderId} updated to ${newStatus}`);
      await fetchStoredOrders();
      if (data.order) {
        setSelectedOrderForVerification(data.order);
      }
      setVerificationNoteInput("");
    } catch (err: any) {
      alert(err.message || "Failed to update payment status.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const activePass = getAdminPasscode();
    if (passcode === activePass) {
      setIsAuthenticated(true);
      sessionStorage.setItem("aura_admin_auth", "true");
      setAuthError("");
      loadAdminData();
    } else {
      setAuthError("Invalid admin access credentials.");
    }
  };

  const handleUpdatePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const activePass = getAdminPasscode();
    if (currentPasscodeAttempt !== activePass) {
      setPasscodeMsg({ type: "error", text: "Current passcode is incorrect." });
      return;
    }
    if (newPasscode.length < 4) {
      setPasscodeMsg({ type: "error", text: "New passcode must be at least 4 characters long." });
      return;
    }
    if (newPasscode !== confirmPasscode) {
      setPasscodeMsg({ type: "error", text: "New passcode and confirmation do not match." });
      return;
    }
    localStorage.setItem("aura_admin_passcode", newPasscode);
    setHasCustomPasscode(true);
    setCurrentPasscodeAttempt("");
    setNewPasscode("");
    setConfirmPasscode("");
    setPasscodeMsg({ type: "success", text: "Admin passcode successfully updated! Use your new passcode on next login." });
    showToast("Admin passcode updated successfully!");
  };

  const handleResetPasscode = () => {
    if (confirm("Reset admin passcode back to default ('aura2026')?")) {
      localStorage.removeItem("aura_admin_passcode");
      setHasCustomPasscode(false);
      setCurrentPasscodeAttempt("");
      setNewPasscode("");
      setConfirmPasscode("");
      setPasscodeMsg({ type: "success", text: "Passcode reset to default ('aura2026')." });
      showToast("Passcode reset to default!");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("aura_admin_auth");
    setIsAuthenticated(false);
    setPasscode("");
  };

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatusInStorage(orderId, status);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
    );
    showToast(`Order ${orderId} marked as ${status}`);
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert("No orders available to export.");
      return;
    }

    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Phone",
      "Email",
      "City",
      "State",
      "PIN",
      "Total (INR)",
      "Payment Method",
      "Payment Status",
      "Fulfilment Status"
    ];

    const rows = orders.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleDateString("en-IN"),
      `"${o.shippingAddress.fullName}"`,
      `"${o.shippingAddress.phone}"`,
      `"${o.shippingAddress.email}"`,
      `"${o.shippingAddress.city}"`,
      `"${o.shippingAddress.state}"`,
      `"${o.shippingAddress.pincode}"`,
      o.total,
      o.paymentMethod,
      o.paymentStatus,
      o.orderStatus
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aura_orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Orders CSV exported successfully!");
  };

  // ─── Font Switching in Admin ────────────────────────────────────────────────
  const handleApplyFont = (font: AuraFont) => {
    setActiveFont(font);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-font", font);
      document.body.setAttribute("data-font", font);
      document.documentElement.style.setProperty("--font-heading", FONT_MAP[font].family);
      localStorage.setItem("aura_font", font);
    }
    showToast(`Store font set to "${FONT_MAP[font].label}"!`);
  };

  // ─── Image Helpers for New / Edit Product ───────────────────────────────────
  const handleImageUpload = (files: FileList | null, isEdit: boolean) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file (PNG, JPG, WebP, GIF).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          if (isEdit) {
            setEditingProduct((prev) =>
              prev ? { ...prev, images: [...prev.images, dataUrl] } : null
            );
          } else {
            setNewProdImages((prev) => [...prev, dataUrl]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
    showToast("Image(s) loaded successfully!");
  };

  const handleAddImageUrl = (url: string, isEdit: boolean) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (isEdit && editingProduct) {
      setEditingProduct({
        ...editingProduct,
        images: [...editingProduct.images, trimmed]
      });
      setEditImageUrlInput("");
    } else {
      setNewProdImages((prev) => [...prev, trimmed]);
      setNewProdImageUrlInput("");
    }
    showToast("Image URL added to product gallery!");
  };

  const handleRemoveImage = (index: number, isEdit: boolean) => {
    if (isEdit && editingProduct) {
      const remaining = editingProduct.images.filter((_, i) => i !== index);
      setEditingProduct({
        ...editingProduct,
        images: remaining.length > 0 ? remaining : ["/images/logo.png"]
      });
    } else {
      setNewProdImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSetPrimaryImage = (index: number, isEdit: boolean) => {
    if (isEdit && editingProduct) {
      const imgs = [...editingProduct.images];
      const [chosen] = imgs.splice(index, 1);
      setEditingProduct({
        ...editingProduct,
        images: [chosen, ...imgs]
      });
    } else {
      setNewProdImages((prev) => {
        const imgs = [...prev];
        const [chosen] = imgs.splice(index, 1);
        return [chosen, ...imgs];
      });
    }
    showToast("Set as primary display image!");
  };

  // ─── Save Edited Product ───────────────────────────────────────────────────
  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const finalImages = editingProduct.images.length > 0 ? editingProduct.images : ["/images/logo.png"];
    const updatedProduct = { ...editingProduct, images: finalImages };
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    setProducts(updated);
    saveStoreProducts(updated);
    setEditingProduct(null);
    showToast(`Product "${updatedProduct.name}" updated successfully!`);
  };

  // ─── Add New Product ────────────────────────────────────────────────────────
  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const finalImages = newProdImages.length > 0 
      ? newProdImages 
      : ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80"];

    const newProd: Product = {
      id: `aura-custom-${Date.now()}`,
      slug: newProdName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: newProdName.trim(),
      tagline: newProdTagline.trim() || "Handcrafted Indian home-fragrance formulation",
      category: newProdCategory,
      fragranceFamily: newProdFragrance,
      price: Number(newProdPrice),
      mrp: Number(newProdMrp) > Number(newProdPrice) ? Number(newProdMrp) : Number(newProdPrice) + 100,
      rating: 5.0,
      reviewCount: 1,
      inStock: true,
      stockCount: Number(newProdStock),
      netWeight: newProdNetWeight.trim() || "100ml / 75g soy wax",
      burnTime: newProdBurnTime.trim() || "22–25 Hours",
      jarType: "Frosted Glass Jar with Gold Accents",
      waxType: "100% Pure Soy Wax Blend",
      description: newProdDescription.trim(),
      notes: {
        top: ["Botanical Essence"],
        heart: [newProdName.trim()],
        base: ["Warm Sandalwood & Tonka"]
      },
      careInstructions: [
        "Trim wick to 6mm before every lighting.",
        "Allow full wax pool on first burn.",
        "Never leave burning candle unattended."
      ],
      images: finalImages,
      collection: "The Everyday Collection"
    };

    const updated = [newProd, ...products];
    setProducts(updated);
    saveStoreProducts(updated);
    setIsAddProductOpen(false);
    setNewProdName("");
    setNewProdImages([]);
    showToast(`New product "${newProd.name}" published to store catalogue!`);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}" from the store?`)) return;
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    saveStoreProducts(updated);
    showToast(`Product "${productName}" removed from catalogue.`);
  };

  const handleResetCatalog = () => {
    if (!confirm("Reset all products to the default catalog? Any custom products or edits will be reset.")) return;
    const defaults = resetStoreProducts();
    setProducts(defaults);
    showToast("Catalogue restored to official default products.");
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderStatusFilter === "All" || o.orderStatus === orderStatusFilter;
    const matchSearch =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.shippingAddress.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.shippingAddress.phone.includes(orderSearch);
    return matchStatus && matchSearch;
  });

  const filteredStoredOrders = storedOrders.filter((ord) => {
    const q = upiSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      ord.orderId.toLowerCase().includes(q) ||
      ord.customerDetails.fullName.toLowerCase().includes(q) ||
      ord.customerDetails.phone.includes(q) ||
      (ord.proof?.transactionReference && ord.proof.transactionReference.toLowerCase().includes(q));

    const matchStatus =
      upiStatusFilter === "All" || ord.paymentStatus === upiStatusFilter;

    return matchSearch && matchStatus;
  });

  const pendingVerificationCount = storedOrders.filter(
    (o) => o.paymentStatus === "PAYMENT_REVIEW"
  ).length;

  const totalVerifiedPaise = storedOrders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + o.totalPaise, 0);

  const totalRevenue = totalVerifiedPaise > 0
    ? totalVerifiedPaise / 100
    : orders.reduce((sum, o) => sum + (o.paymentStatus === "Paid" ? o.total : 0), 0);
  const lowStockCount = products.filter((p) => p.stockCount < 30).length;

  if (!isAuthenticated) {
    return (
      <div className="py-24 bg-white min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#EAE0D5] shadow-card space-y-6 text-center">
          <div className="w-14 h-14 rounded-full bg-white border border-[#E8C9C5] flex items-center justify-center mx-auto text-[#452638] shadow-sm">
            <Lock className="w-6 h-6 text-[#B69A62]" />
          </div>

          <div className="space-y-1">
            <h1 className="font-serif text-2xl text-[#452638] font-medium">
              AURA SPARKLES Admin
            </h1>
            <p className="text-xs text-[#766E65]">
              Protected store operations, product management &amp; typography portal.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder={hasCustomPasscode ? "Enter Admin Passcode" : "Enter Admin Passcode (Default: aura2026)"}
                className="w-full px-4 py-3 bg-white border border-[#EAE0D5] rounded-xl text-xs text-center tracking-widest focus:outline-none focus:border-[#452638]"
              />
            </div>

            {authError && <p className="text-xs text-red-600">{authError}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-[#452638] hover:bg-[#5D354D] text-white text-xs font-semibold tracking-luxury uppercase rounded-xl transition-all shadow-sm"
            >
              Sign In to Store
            </button>
          </form>

          <p className="text-[10px] text-[#766E65]">
            Authorized personnel only. Sessions are encrypted locally.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-white min-h-screen">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-[#452638] text-white px-5 py-3 rounded-2xl shadow-elevated border border-[#B69A62]/40 flex items-center space-x-2.5 text-xs animate-scale">
          <Sparkles className="w-4 h-4 text-[#B69A62]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EAE0D5] gap-4">
          <div className="flex items-center space-x-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#B69A62] bg-white p-0.5">
              <Image src="/images/logo.png" alt="AURA" fill className="object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif text-2xl text-[#452638] font-medium">Store Operations Hub</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Live</span>
              </div>
              <p className="text-xs text-[#766E65]">
                AURA SPARKLES Management Dashboard · Active Font: <strong className="text-[#452638] font-semibold">{FONT_MAP[activeFont].label}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-2 border border-[#EAE0D5] text-[#452638] text-xs font-semibold rounded-lg flex items-center space-x-1.5 hover:bg-neutral-50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </Link>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-[#452638] text-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs hover:bg-[#5D354D]"
            >
              <Download className="w-3.5 h-3.5 text-[#B69A62]" />
              <span>Export Orders</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 border border-[#EAE0D5] text-[#766E65] hover:text-[#452638] hover:bg-neutral-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Analytics KPI Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#EAE0D5] shadow-subtle space-y-2">
            <div className="flex items-center justify-between text-[#766E65]">
              <span className="text-xs font-medium uppercase tracking-wider">Gross Revenue</span>
              <TrendingUp className="w-4 h-4 text-[#B69A62]" />
            </div>
            <p className="font-serif text-2xl font-bold text-[#452638]">{formatINR(totalRevenue)}</p>
            <p className="text-[11px] text-[#766E65]">From verified paid orders</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EAE0D5] shadow-subtle space-y-2">
            <div className="flex items-center justify-between text-[#766E65]">
              <span className="text-xs font-medium uppercase tracking-wider">UPI Verifications</span>
              <QrCode className="w-4 h-4 text-[#B69A62]" />
            </div>
            <div className="flex items-baseline space-x-2">
              <p className="font-serif text-2xl font-bold text-[#452638]">{pendingVerificationCount}</p>
              {pendingVerificationCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  Review Needed
                </span>
              )}
            </div>
            <button
              onClick={() => setActiveTab("upi")}
              className="text-[11px] text-[#B69A62] hover:underline font-semibold block"
            >
              Inspect Payment Proofs →
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EAE0D5] shadow-subtle space-y-2">
            <div className="flex items-center justify-between text-[#766E65]">
              <span className="text-xs font-medium uppercase tracking-wider">Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-[#B69A62]" />
            </div>
            <p className="font-serif text-2xl font-bold text-[#452638]">
              {orders.length + storedOrders.length}
            </p>
            <p className="text-[11px] text-[#766E65]">Stored across database</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EAE0D5] shadow-subtle space-y-2">
            <div className="flex items-center justify-between text-[#766E65]">
              <span className="text-xs font-medium uppercase tracking-wider">Catalogue Items</span>
              <Package className="w-4 h-4 text-[#B69A62]" />
            </div>
            <p className="font-serif text-2xl font-bold text-[#452638]">{products.length}</p>
            <button
              onClick={() => setActiveTab("products")}
              className="text-[11px] text-[#B69A62] hover:underline font-semibold"
            >
              Manage Products →
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#EAE0D5] space-x-6 sm:space-x-8 text-xs font-semibold uppercase tracking-luxury overflow-x-auto">
          <button
            onClick={() => setActiveTab("upi")}
            className={`pb-3 transition-colors relative whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === "upi" ? "text-[#452638]" : "text-[#766E65] hover:text-[#452638]"
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-[#B69A62]" />
            <span>UPI Verifications ({storedOrders.length})</span>
            {pendingVerificationCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white animate-pulse">
                {pendingVerificationCount} New
              </span>
            )}
            {activeTab === "upi" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#452638]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 transition-colors relative whitespace-nowrap ${
              activeTab === "orders" ? "text-[#452638]" : "text-[#766E65] hover:text-[#452638]"
            }`}
          >
            Orders &amp; Shipments ({orders.length})
            {activeTab === "orders" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#452638]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`pb-3 transition-colors relative whitespace-nowrap ${
              activeTab === "products" ? "text-[#452638]" : "text-[#766E65] hover:text-[#452638]"
            }`}
          >
            Product Catalogue ({products.length})
            {activeTab === "products" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#452638]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3 transition-colors relative whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === "settings" ? "text-[#452638]" : "text-[#766E65] hover:text-[#452638]"
            }`}
          >
            <Type className="w-3.5 h-3.5 text-[#B69A62]" />
            <span>Store Fonts &amp; Settings</span>
            {activeTab === "settings" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#452638]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("coupons")}
            className={`pb-3 transition-colors relative whitespace-nowrap ${
              activeTab === "coupons" ? "text-[#452638]" : "text-[#766E65] hover:text-[#452638]"
            }`}
          >
            Promo Coupons ({coupons.length})
            {activeTab === "coupons" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#452638]" />
            )}
          </button>
        </div>

        {/* ─── TAB: UPI Payment Verification ─── */}
        {activeTab === "upi" && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#EAE0D5] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#766E65] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={upiSearch}
                  onChange={(e) => setUpiSearch(e.target.value)}
                  placeholder="Search by Order ID, Customer name, Phone, or UTR / Transaction ID..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#766E65] font-medium text-xs">Filter Status:</span>
                <select
                  value={upiStatusFilter}
                  onChange={(e) => setUpiStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#452638] font-medium"
                >
                  <option value="All">All ({storedOrders.length})</option>
                  <option value="PAYMENT_REVIEW">Review Required ({storedOrders.filter(o => o.paymentStatus === 'PAYMENT_REVIEW').length})</option>
                  <option value="PENDING_PAYMENT">Pending Payment ({storedOrders.filter(o => o.paymentStatus === 'PENDING_PAYMENT').length})</option>
                  <option value="PAID">Paid &amp; Verified ({storedOrders.filter(o => o.paymentStatus === 'PAID').length})</option>
                  <option value="PAYMENT_REJECTED">Proof Rejected ({storedOrders.filter(o => o.paymentStatus === 'PAYMENT_REJECTED').length})</option>
                  <option value="REFUNDED">Refunded ({storedOrders.filter(o => o.paymentStatus === 'REFUNDED').length})</option>
                  <option value="PAYMENT_EXPIRED">Expired ({storedOrders.filter(o => o.paymentStatus === 'PAYMENT_EXPIRED').length})</option>
                </select>

                <button
                  onClick={fetchStoredOrders}
                  disabled={isVerifying}
                  className="px-3 py-2 border border-[#EAE0D5] rounded-xl text-xs font-semibold text-[#452638] hover:bg-neutral-50 flex items-center space-x-1"
                  title="Refresh orders list"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#B69A62] ${isVerifying ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Verification Instruction Banner */}
            <div className="bg-[#452638]/5 border border-[#452638]/15 rounded-2xl p-4 flex items-start space-x-3 text-xs">
              <ShieldCheck className="w-5 h-5 text-[#B69A62] flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-[#452638]">
                  Manual Bank Reconciliation Standard Operating Procedure
                </p>
                <p className="text-[11px] text-[#766E65] leading-relaxed">
                  A screenshot is customer-submitted evidence. <strong>Never</strong> mark an order as PAID without independently confirming that the exact amount has credited your HDFC Bank account and that the bank transaction reference matches the customer's submitted UTR.
                </p>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-[#EAE0D5] shadow-subtle overflow-x-auto">
              {filteredStoredOrders.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#766E65] space-y-2">
                  <QrCode className="w-8 h-8 text-[#B69A62] mx-auto opacity-50" />
                  <p className="font-medium text-[#452638]">No orders found for the current search or status filter.</p>
                  <p className="text-[11px]">Orders placed via UPI checkout will immediately appear here for payment verification.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#EAE0D5] bg-neutral-50 text-[#766E65] uppercase text-[10px] tracking-wider font-semibold">
                      <th className="p-4">Order ID &amp; Date</th>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">UPI UTR / Reference</th>
                      <th className="p-4">Screenshot Proof</th>
                      <th className="p-4">Payment Status</th>
                      <th className="p-4 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE0D5]">
                    {filteredStoredOrders.map((ord) => {
                      const amountRupees = ord.totalPaise / 100;
                      return (
                        <tr key={ord.orderId} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="p-4 align-top">
                            <p className="font-mono font-bold text-[#452638]">{ord.orderId}</p>
                            <p className="text-[11px] text-[#766E65]">
                              {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-neutral-100 text-[#766E65]">
                              {ord.items.reduce((s, i) => s + i.quantity, 0)} items
                            </span>
                          </td>

                          <td className="p-4 align-top">
                            <p className="font-semibold text-[#452638]">{ord.customerDetails.fullName}</p>
                            <p className="text-[11px] text-[#766E65]">{ord.customerDetails.phone}</p>
                            <p className="text-[10px] text-[#766E65]">
                              {ord.customerDetails.city}, {ord.customerDetails.state}
                            </p>
                          </td>

                          <td className="p-4 align-top">
                            <p className="font-bold text-[#452638]">{formatINR(amountRupees)}</p>
                            <p className="text-[10px] text-[#766E65]">{ord.totalPaise} paise</p>
                          </td>

                          <td className="p-4 align-top">
                            {ord.proof?.transactionReference ? (
                              <div className="flex items-center space-x-1.5">
                                <span className="font-mono font-semibold text-[#452638] bg-neutral-100 px-2 py-1 rounded text-xs select-all">
                                  {ord.proof.transactionReference}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyUtr(ord.proof!.transactionReference)}
                                  className="p-1 text-[#766E65] hover:text-[#452638] rounded hover:bg-neutral-100 transition-colors"
                                  title="Copy UTR"
                                >
                                  {copiedUtr === ord.proof.transactionReference ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#766E65] italic">Not submitted</span>
                            )}
                          </td>

                          <td className="p-4 align-top">
                            {ord.proof ? (
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Uploaded
                                </span>
                                <span className="text-[10px] text-[#766E65]">
                                  ({(((ord.proof.fileSizeBytes || 0)) / 1024).toFixed(0)} KB)
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-[#766E65]">
                                Awaiting Upload
                              </span>
                            )}
                          </td>

                          <td className="p-4 align-top">
                            {ord.paymentStatus === "PAYMENT_REVIEW" && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5" />
                                Review Required
                              </span>
                            )}
                            {ord.paymentStatus === "PENDING_PAYMENT" && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700">
                                Pending Payment
                              </span>
                            )}
                            {ord.paymentStatus === "PAID" && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Paid &amp; Verified
                              </span>
                            )}
                            {ord.paymentStatus === "PAYMENT_REJECTED" && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-100 text-red-800 border border-red-200">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Rejected
                              </span>
                            )}
                            {ord.paymentStatus === "REFUNDED" && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800">
                                Refunded
                              </span>
                            )}
                            {ord.paymentStatus === "PAYMENT_EXPIRED" && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-neutral-200 text-neutral-800">
                                Expired
                              </span>
                            )}
                          </td>

                          <td className="p-4 align-top text-right">
                            <button
                              onClick={() => {
                                setSelectedOrderForVerification(ord);
                                setVerificationNoteInput(ord.proof?.verificationNote || "");
                              }}
                              className="px-3 py-1.5 bg-[#452638] text-white rounded-lg text-xs font-semibold hover:bg-[#5D354D] transition-colors shadow-xs inline-flex items-center space-x-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#B69A62]" />
                              <span>{ord.paymentStatus === "PAYMENT_REVIEW" ? "Review & Verify" : "Inspect Order"}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 1: Orders Table ─── */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-[#EAE0D5] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="w-4 h-4 text-[#766E65] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by Order ID, customer name or phone..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                />
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-[#766E65]">Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#452638] font-medium"
                >
                  <option value="All">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#EAE0D5] shadow-subtle overflow-x-auto">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#766E65]">
                  No orders found. Orders placed via checkout will immediately display here.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#EAE0D5] bg-neutral-50 text-[#766E65] uppercase text-[10px] tracking-wider font-semibold">
                      <th className="p-4">Order ID &amp; Date</th>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Total &amp; Payment</th>
                      <th className="p-4">Fulfilment Status</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE0D5]">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="p-4 align-top">
                          <p className="font-mono font-bold text-[#452638]">{ord.id}</p>
                          <p className="text-[11px] text-[#766E65]">
                            {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </p>
                        </td>

                        <td className="p-4 align-top">
                          <p className="font-semibold text-[#452638]">{ord.shippingAddress.fullName}</p>
                          <p className="text-[11px] text-[#766E65]">{ord.shippingAddress.phone}</p>
                          <p className="text-[11px] text-[#766E65]">
                            {ord.shippingAddress.city}, {ord.shippingAddress.state} — {ord.shippingAddress.pincode}
                          </p>
                        </td>

                        <td className="p-4 align-top">
                          <div className="space-y-1">
                            {ord.items.map((it) => (
                              <p key={it.product.id} className="text-[11px] text-[#282522]">
                                {it.quantity} × {it.product.name}
                              </p>
                            ))}
                          </div>
                        </td>

                        <td className="p-4 align-top">
                          <p className="font-bold text-[#452638] text-sm">{formatINR(ord.total)}</p>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.paymentStatus === "Paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {ord.paymentStatus} ({ord.paymentMethod})
                          </span>
                        </td>

                        <td className="p-4 align-top">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              ord.orderStatus === "Delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : ord.orderStatus === "Shipped"
                                ? "bg-blue-100 text-blue-800"
                                : ord.orderStatus === "Processing"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                        </td>

                        <td className="p-4 align-top">
                          <select
                            value={ord.orderStatus}
                            onChange={(e) =>
                              handleStatusChange(ord.id, e.target.value as OrderStatus)
                            }
                            className="px-2.5 py-1.5 border border-[#EAE0D5] rounded-lg text-xs bg-white text-[#452638] font-medium focus:outline-none focus:border-[#452638]"
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 2: Products Catalogue Table ─── */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-[#EAE0D5] gap-3">
              <div>
                <p className="text-xs font-semibold text-[#452638]">Catalogue &amp; Inventory Management</p>
                <p className="text-[11px] text-[#766E65]">
                  Add new products, upload images from your device or via URL, edit prices &amp; inventory.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleResetCatalog}
                  className="px-3.5 py-2 border border-[#EAE0D5] hover:border-[#B69A62] text-[#766E65] hover:text-[#452638] rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
                  title="Reset to default items"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Catalog</span>
                </button>

                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="px-4 py-2 bg-[#452638] text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 hover:bg-[#5D354D] shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#B69A62]" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#EAE0D5] shadow-subtle overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#EAE0D5] bg-neutral-50 text-[#766E65] uppercase text-[10px] tracking-wider font-semibold">
                    <th className="p-4">Product &amp; Images</th>
                    <th className="p-4">Category &amp; Scent</th>
                    <th className="p-4">Price / MRP</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Images Count</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE0D5]">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="p-4 flex items-center space-x-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-[#EAE0D5] p-1 shadow-xs">
                          <Image 
                            src={prod.images[0] || "/images/logo.png"} 
                            alt={prod.name} 
                            fill 
                            className="object-contain" 
                          />
                        </div>
                        <div>
                          <p className="font-serif font-semibold text-sm text-[#452638]">{prod.name}</p>
                          <p className="text-[10px] text-[#766E65]">{prod.netWeight} · {prod.burnTime}</p>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="font-medium text-[#452638]">{prod.category}</p>
                        <p className="text-[11px] text-[#B69A62]">{prod.fragranceFamily}</p>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-[#452638] text-sm">{formatINR(prod.price)}</p>
                        <p className="text-[10px] text-[#766E65] line-through">MRP {formatINR(prod.mrp)}</p>
                      </td>

                      <td className="p-4">
                        <span className={`font-semibold ${prod.stockCount < 30 ? "text-rose-700" : "text-[#452638]"}`}>
                          {prod.stockCount} in stock
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-neutral-100 text-[#452638]">
                          <ImageIcon className="w-3 h-3 text-[#B69A62]" />
                          <span>{prod.images.length} {prod.images.length === 1 ? "image" : "images"}</span>
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingProduct(prod)}
                          className="px-3 py-1.5 border border-[#452638] text-[#452638] hover:bg-[#452638] hover:text-white rounded-lg transition-colors font-medium inline-flex items-center space-x-1"
                          title="Edit product details and images"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit &amp; Images</span>
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB 3: Store Fonts & Appearance (Settings) ─── */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#EAE0D5] shadow-subtle space-y-2">
              <div className="flex items-center space-x-2">
                <Type className="w-5 h-5 text-[#B69A62]" />
                <h2 className="font-serif text-2xl text-[#452638]">Storefront Typography &amp; Brand Fonts</h2>
              </div>
              <p className="text-xs text-[#766E65] max-w-2xl leading-relaxed">
                Choose the brand headline font for your store. When changed here, it immediately updates the headlines, product titles, cards, and banners across the whole website for all customers.
              </p>
            </div>

            {/* Font Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FONT_LIST.map((fKey) => {
                const font = FONT_MAP[fKey];
                const isActive = activeFont === fKey;
                return (
                  <div
                    key={fKey}
                    className={`p-6 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between space-y-4 ${
                      isActive
                        ? "bg-amber-50/20 border-[#B69A62] shadow-elevated ring-2 ring-[#B69A62]/30"
                        : "bg-white border-[#EAE0D5] hover:border-[#B69A62]/50 shadow-xs"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-luxury uppercase text-[#B69A62]">
                          Luxury Font Style
                        </span>
                        {isActive && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <Check className="w-3 h-3" />
                            <span>Active Store Font</span>
                          </span>
                        )}
                      </div>

                      <h3 
                        className="text-2xl text-[#452638] font-medium"
                        style={{ fontFamily: font.family }}
                      >
                        {font.label}
                      </h3>

                      <p className="text-xs text-[#766E65] leading-relaxed">
                        {font.desc}
                      </p>

                      {/* Live Typography Preview Box */}
                      <div className="p-4 bg-white rounded-xl border border-[#EAE0D5]/70 space-y-1">
                        <p 
                          className="text-lg text-[#452638] font-medium leading-tight"
                          style={{ fontFamily: font.family }}
                        >
                          Illuminate Your Moments
                        </p>
                        <p className="text-[11px] text-[#766E65]">
                          Hand-poured 100% natural soy wax candles · ₹299
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyFont(fKey)}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                        isActive
                          ? "bg-emerald-700 text-white shadow-xs cursor-default"
                          : "bg-[#452638] hover:bg-[#5D354D] text-white shadow-xs hover:shadow-md"
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Currently Selected</span>
                        </>
                      ) : (
                        <>
                          <Type className="w-3.5 h-3.5 text-[#B69A62]" />
                          <span>Apply "{font.label}"</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Live Storefront Preview Widget */}
            <div className="bg-white p-6 rounded-2xl border border-[#EAE0D5] shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE0D5] pb-3">
                <span className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">
                  Live Typography Simulator
                </span>
                <span className="text-xs text-[#766E65]">
                  Previewing: <strong className="text-[#452638] font-semibold">{FONT_MAP[activeFont].label}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-2">
                  <p 
                    className="text-3xl sm:text-4xl text-[#452638] font-medium leading-tight"
                    style={{ fontFamily: FONT_MAP[activeFont].family }}
                  >
                    Mysore Sandalwood Signature Candle
                  </p>
                  <p className="text-sm text-[#766E65] leading-relaxed">
                    Sacred sandalwood, smoked cedar and rich tonka bean in handcrafted frosted glass.
                  </p>
                  <p className="font-bold text-xl text-[#452638]">₹299 <span className="text-xs text-[#766E65] line-through font-normal">MRP ₹399</span></p>
                </div>

                <div className="p-6 rounded-2xl bg-neutral-50 border border-[#EAE0D5] text-center space-y-3">
                  <p className="text-xs uppercase tracking-luxury text-[#B69A62] font-semibold">Customer Testimonial Sample</p>
                  <p 
                    className="text-xl text-[#452638] italic font-light"
                    style={{ fontFamily: FONT_MAP[activeFont].family }}
                  >
                    “The fragrance instantly transforms my living room into a tranquil haven.”
                  </p>
                  <p className="text-xs text-[#766E65] font-semibold">— Dr. Priya Nair, Bengaluru</p>
                </div>
              </div>
            </div>

            {/* ─── Admin Security & Passcode Manager ─── */}
            <div className="bg-white p-6 rounded-2xl border border-[#EAE0D5] shadow-subtle space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE0D5] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-5 h-5 text-[#B69A62]" />
                    <h2 className="font-serif text-xl text-[#452638]">Admin Portal Security &amp; Passcode</h2>
                  </div>
                  <p className="text-xs text-[#766E65]">
                    Change your admin passcode below. The updated passcode takes effect immediately on your next sign-in.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    hasCustomPasscode 
                      ? "bg-purple-50 text-purple-800 border border-purple-200" 
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{hasCustomPasscode ? "Custom Passcode Active" : "Default Passcode (aura2026)"}</span>
                  </span>
                </div>
              </div>

              {passcodeMsg && (
                <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${
                  passcodeMsg.type === "success" 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}>
                  {passcodeMsg.type === "success" ? (
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{passcodeMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePasscode} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#452638] mb-1.5">
                    Current Passcode
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPasscodeAttempt}
                    onChange={(e) => setCurrentPasscodeAttempt(e.target.value)}
                    placeholder="Enter current passcode"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#452638] mb-1.5">
                    New Passcode
                  </label>
                  <input
                    type="password"
                    required
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Minimum 4 characters"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#452638] mb-1.5">
                    Confirm New Passcode
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    placeholder="Re-type new passcode"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
                  />
                </div>

                <div className="sm:col-span-3 flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#452638] hover:bg-[#5D354D] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center space-x-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#B69A62]" />
                    <span>Update Passcode</span>
                  </button>

                  {hasCustomPasscode && (
                    <button
                      type="button"
                      onClick={handleResetPasscode}
                      className="px-4 py-2.5 bg-white hover:bg-neutral-50 text-red-700 border border-red-200 text-xs font-semibold rounded-xl transition-colors"
                    >
                      Reset Passcode to Default (aura2026)
                    </button>
                  )}
                </div>
              </form>

              <div className="p-4 bg-neutral-50 rounded-xl border border-[#EAE0D5]/70 text-[11px] text-[#766E65] space-y-1">
                <p className="font-semibold text-[#452638]">Production Deployment Note:</p>
                <p>
                  You can also configure the admin passcode in your production environment (such as Vercel, Netlify, or your host server) by setting the environment variable <code className="bg-white px-1.5 py-0.5 rounded border border-[#EAE0D5] text-[#452638] font-mono">NEXT_PUBLIC_ADMIN_PASSCODE=YourSecurePassword</code>.
                </p>
              </div>
            </div>

            {/* ─── Razorpay Payment Gateway Integration ─── */}
            <div className="bg-white p-6 rounded-2xl border border-[#EAE0D5] shadow-subtle space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE0D5] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-[#B69A62]" />
                    <h2 className="font-serif text-xl text-[#452638]">Razorpay Payment Gateway</h2>
                  </div>
                  <p className="text-xs text-[#766E65]">
                    Accept UPI (Google Pay, PhonePe, Paytm, BHIM), Indian &amp; International Credit/Debit Cards, NetBanking, and Wallets.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Razorpay Ready</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 rounded-xl border border-[#EAE0D5] space-y-2">
                  <p className="text-xs font-semibold text-[#452638] flex items-center space-x-1.5">
                    <span>1. Supported Payment Channels</span>
                  </p>
                  <ul className="text-xs text-[#766E65] space-y-1 list-disc pl-4">
                    <li><strong>UPI QR &amp; Intent:</strong> Google Pay, PhonePe, Paytm, CRED, BHIM</li>
                    <li><strong>Cards:</strong> Visa, MasterCard, RuPay, Amex, Diners Club</li>
                    <li><strong>NetBanking:</strong> 50+ Indian banks (HDFC, ICICI, SBI, Axis, etc.)</li>
                    <li><strong>Wallets &amp; EMI:</strong> PayTM, Mobikwik, LazyPay, Cardless EMI</li>
                  </ul>
                </div>

                <div className="p-4 bg-neutral-50 rounded-xl border border-[#EAE0D5] space-y-2">
                  <p className="text-xs font-semibold text-[#452638] flex items-center space-x-1.5">
                    <span>2. How to Connect Live Gateway</span>
                  </p>
                  <ol className="text-xs text-[#766E65] space-y-1 list-decimal pl-4">
                    <li>Log into your <a href="https://dashboard.razorpay.com/#/access/api-keys" target="_blank" rel="noopener noreferrer" className="text-[#452638] font-semibold underline">Razorpay Dashboard</a>.</li>
                    <li>Go to <strong>Settings</strong> &rarr; <strong>API Keys</strong> &rarr; Click <strong>Generate Key</strong>.</li>
                    <li>Copy your <strong>Key ID</strong> and <strong>Key Secret</strong>.</li>
                    <li>In your Vercel project, go to <strong>Settings &rarr; Environment Variables</strong> and add:
                      <div className="mt-1 font-mono text-[11px] bg-white p-2 rounded border border-[#EAE0D5] text-[#452638]">
                        RAZORPAY_KEY_ID = rzp_live_xxxxxxxx<br />
                        RAZORPAY_KEY_SECRET = your_secret_key
                      </div>
                    </li>
                  </ol>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-xs text-amber-900 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Test Mode Fallback:</strong> If keys are not yet configured in your production environment, the checkout will safely operate in verified demo mode so that customer test orders and checkout preview flows can be tested without errors.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: Coupons ─── */}
        {activeTab === "coupons" && (
          <div className="bg-white p-6 rounded-2xl border border-[#EAE0D5] shadow-subtle space-y-4">
            <h2 className="font-serif text-xl text-[#452638]">Active Promotional Coupons</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coupons.map((c) => (
                <div key={c.code} className="p-4 rounded-xl border border-[#B69A62]/30 bg-white space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-bold text-[#452638] tracking-wider">
                      {c.code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-[#766E65]">{c.description}</p>
                  <p className="text-[10px] text-[#B69A62] font-semibold">
                    Min Order: {formatINR(c.minOrderValue)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ─── MODAL 1: Edit Product & Image Manager ─── */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scale my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EAE0D5] pb-4">
              <div>
                <span className="text-[10px] font-bold tracking-luxury uppercase text-[#B69A62]">Product Editor</span>
                <h3 className="font-serif text-2xl text-[#452638] font-medium">Edit: {editingProduct.name}</h3>
              </div>
              <button 
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-[#766E65]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="space-y-6 text-xs">
              
              {/* Product Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[#452638] font-semibold mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#452638] font-semibold mb-1">Category</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs"
                    >
                      <option>Scented Candles</option>
                      <option>Tea-Light Candles</option>
                      <option>Decorative Candles</option>
                      <option>Gift Sets</option>
                      <option>Combo Offers</option>
                      <option>Wax Sachets</option>
                      <option>Hanging Fragrance Bars</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#452638] font-semibold mb-1">Fragrance Mood</label>
                    <select
                      value={editingProduct.fragranceFamily}
                      onChange={(e) => setEditingProduct({ ...editingProduct, fragranceFamily: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs"
                    >
                      <option>Floral & Romantic</option>
                      <option>Warm & Comforting</option>
                      <option>Fresh & Refreshing</option>
                      <option>Calm & Relaxing</option>
                      <option>Earthy & Woody</option>
                      <option>Rich & Resinous</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#452638] font-semibold mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[#452638] font-semibold mb-1">MRP (₹)</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.mrp}
                      onChange={(e) => setEditingProduct({ ...editingProduct, mrp: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[#452638] font-semibold mb-1">Stock Units</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.stockCount}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stockCount: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#452638] font-semibold mb-1">Net Weight</label>
                    <input
                      type="text"
                      value={editingProduct.netWeight}
                      onChange={(e) => setEditingProduct({ ...editingProduct, netWeight: e.target.value })}
                      placeholder="e.g. 100ml / 75g soy wax"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[#452638] font-semibold mb-1">Burn Time</label>
                    <input
                      type="text"
                      value={editingProduct.burnTime}
                      onChange={(e) => setEditingProduct({ ...editingProduct, burnTime: e.target.value })}
                      placeholder="e.g. 22–25 Hours"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#452638] font-semibold mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* ─── Image Manager Section ─── */}
              <div className="border-t border-[#EAE0D5] pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-semibold text-[#452638]">
                      Product Gallery &amp; Images ({editingProduct.images.length})
                    </label>
                    <p className="text-[11px] text-[#766E65]">
                      Upload photos from your device or paste an image URL. Image #1 will be the primary cover.
                    </p>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files, true)}
                  />

                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-[#452638] text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 hover:bg-[#5D354D] shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#B69A62]" />
                    <span>Upload Image File</span>
                  </button>
                </div>

                {/* Paste URL Bar */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editImageUrlInput}
                    onChange={(e) => setEditImageUrlInput(e.target.value)}
                    placeholder="Or paste an image web link (https://...)"
                    className="flex-1 px-3.5 py-2 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImageUrl(editImageUrlInput, true)}
                    className="px-4 py-2 border border-[#452638] text-[#452638] hover:bg-[#452638] hover:text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Add URL
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-[#766E65]">Quick templates:</span>
                  {SAMPLE_PRESET_IMAGES.map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => handleAddImageUrl(sample.url, true)}
                      className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-[#452638] rounded-md text-[10px] transition-colors"
                    >
                      + {sample.label}
                    </button>
                  ))}
                </div>

                {/* Gallery Grid of Current Images */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {editingProduct.images.map((imgUrl, idx) => (
                    <div 
                      key={idx}
                      className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-[#EAE0D5] bg-white p-2 shadow-xs flex items-center justify-center"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className="object-contain p-2"
                      />

                      {/* Primary Badge */}
                      {idx === 0 ? (
                        <span className="absolute top-2 left-2 bg-[#452638] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                          Primary
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx, true)}
                          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-white text-[#452638] text-[9px] font-semibold px-2 py-0.5 rounded-full shadow-xs border border-[#EAE0D5] transition-opacity"
                        >
                          Make Cover
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx, true)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 hover:scale-110 transition-all shadow-xs"
                        title="Delete this image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-[#EAE0D5] flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 border border-[#EAE0D5] text-[#766E65] hover:text-[#452638] rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#452638] text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#5D354D] shadow-sm flex items-center space-x-2"
                >
                  <Save className="w-3.5 h-3.5 text-[#B69A62]" />
                  <span>Save All Changes</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: Add New Product & Image Loader ─── */}
      {isAddProductOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scale my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EAE0D5] pb-4">
              <div>
                <span className="text-[10px] font-bold tracking-luxury uppercase text-[#B69A62]">Product Creation</span>
                <h3 className="font-serif text-2xl text-[#452638] font-medium">Add New Fragrance Product</h3>
              </div>
              <button 
                onClick={() => setIsAddProductOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-[#766E65]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewProduct} className="space-y-6 text-xs">
              
              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[#452638] font-semibold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g. Saffron & Damask Rose Glass Jar Candle"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#452638] font-semibold mb-1">Category</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value as ProductCategory)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs"
                    >
                      <option>Scented Candles</option>
                      <option>Tea-Light Candles</option>
                      <option>Decorative Candles</option>
                      <option>Gift Sets</option>
                      <option>Combo Offers</option>
                      <option>Wax Sachets</option>
                      <option>Hanging Fragrance Bars</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#452638] font-semibold mb-1">Fragrance Mood</label>
                    <select
                      value={newProdFragrance}
                      onChange={(e) => setNewProdFragrance(e.target.value as FragranceFamily)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs"
                    >
                      <option>Floral & Romantic</option>
                      <option>Warm & Comforting</option>
                      <option>Fresh & Refreshing</option>
                      <option>Calm & Relaxing</option>
                      <option>Earthy & Woody</option>
                      <option>Rich & Resinous</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#452638] font-semibold mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[#452638] font-semibold mb-1">MRP (₹)</label>
                    <input
                      type="number"
                      required
                      value={newProdMrp}
                      onChange={(e) => setNewProdMrp(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[#452638] font-semibold mb-1">Initial Stock Units</label>
                    <input
                      type="number"
                      required
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#452638] font-semibold mb-1">Net Weight</label>
                    <input
                      type="text"
                      value={newProdNetWeight}
                      onChange={(e) => setNewProdNetWeight(e.target.value)}
                      placeholder="e.g. 100ml / 75g soy wax"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[#452638] font-semibold mb-1">Burn Time</label>
                    <input
                      type="text"
                      value={newProdBurnTime}
                      onChange={(e) => setNewProdBurnTime(e.target.value)}
                      placeholder="e.g. 22–25 Hours"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#452638] font-semibold mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newProdDescription}
                    onChange={(e) => setNewProdDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0D5] rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* ─── Image Upload & Manager Section ─── */}
              <div className="border-t border-[#EAE0D5] pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-semibold text-[#452638]">
                      Product Photos ({newProdImages.length})
                    </label>
                    <p className="text-[11px] text-[#766E65]">
                      Upload photos from your computer/mobile or paste links. The first photo will be used as the primary card cover.
                    </p>
                  </div>

                  {/* Hidden file input for new product */}
                  <input
                    ref={addFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files, false)}
                  />

                  <button
                    type="button"
                    onClick={() => addFileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-[#452638] text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 hover:bg-[#5D354D] shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#B69A62]" />
                    <span>Upload Image File</span>
                  </button>
                </div>

                {/* Paste URL Input */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newProdImageUrlInput}
                    onChange={(e) => setNewProdImageUrlInput(e.target.value)}
                    placeholder="Or paste an image web link (https://...)"
                    className="flex-1 px-3.5 py-2 bg-white border border-[#EAE0D5] rounded-xl text-xs focus:outline-none focus:border-[#452638]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImageUrl(newProdImageUrlInput, false)}
                    className="px-4 py-2 border border-[#452638] text-[#452638] hover:bg-[#452638] hover:text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Add URL
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-[#766E65]">Quick templates:</span>
                  {SAMPLE_PRESET_IMAGES.map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => handleAddImageUrl(sample.url, false)}
                      className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-[#452638] rounded-md text-[10px] transition-colors"
                    >
                      + {sample.label}
                    </button>
                  ))}
                </div>

                {/* Gallery Grid */}
                {newProdImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {newProdImages.map((imgUrl, idx) => (
                      <div 
                        key={idx}
                        className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-[#EAE0D5] bg-white p-2 shadow-xs flex items-center justify-center"
                      >
                        <Image
                          src={imgUrl}
                          alt={`Uploaded photo ${idx + 1}`}
                          fill
                          className="object-contain p-2"
                        />

                        {idx === 0 ? (
                          <span className="absolute top-2 left-2 bg-[#452638] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                            Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx, false)}
                            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-white text-[#452638] text-[9px] font-semibold px-2 py-0.5 rounded-full shadow-xs border border-[#EAE0D5] transition-opacity"
                          >
                            Set Cover
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx, false)}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 hover:scale-110 transition-all shadow-xs"
                          title="Remove image"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div 
                    onClick={() => addFileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#EAE0D5] rounded-2xl p-6 text-center hover:border-[#B69A62] cursor-pointer transition-colors space-y-2 bg-neutral-50/50"
                  >
                    <ImageIcon className="w-8 h-8 text-[#B69A62] mx-auto" />
                    <p className="text-xs font-semibold text-[#452638]">Click to upload product photos from your computer/device</p>
                    <p className="text-[10px] text-[#766E65]">Supports JPG, PNG, WebP · You can upload multiple images</p>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#EAE0D5] flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-5 py-2.5 border border-[#EAE0D5] text-[#766E65] hover:text-[#452638] rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#452638] text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#5D354D] shadow-sm flex items-center space-x-2"
                >
                  <Plus className="w-3.5 h-3.5 text-[#B69A62]" />
                  <span>Publish to Store Catalogue</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: UPI Order Payment Verification & Audit ─── */}
      {selectedOrderForVerification && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#EAE0D5] shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#EAE0D5] flex items-center justify-between bg-neutral-50/50 flex-shrink-0">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h3 className="font-serif text-xl font-bold text-[#452638]">
                    Order Payment Verification
                  </h3>
                  <span className="font-mono text-sm font-bold px-2.5 py-0.5 rounded-lg bg-neutral-100 text-[#452638] border border-[#EAE0D5]">
                    {selectedOrderForVerification.orderId}
                  </span>
                </div>
                <p className="text-xs text-[#766E65]">
                  Created on {new Date(selectedOrderForVerification.createdAt).toLocaleString("en-IN")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrderForVerification(null)}
                className="p-2 text-[#766E65] hover:text-[#452638] rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Top Banner Alert */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed">
                  <p className="font-bold text-amber-950">
                    Security Policy: Strict Bank Statement Verification Required
                  </p>
                  <p className="text-[11px] text-amber-900">
                    Do not accept screenshots alone as proof of payment. Verify your HDFC Bank account statement or UPI merchant notifications to ensure the exact amount has credited before approving.
                  </p>
                </div>
              </div>

              {/* 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column: Order & Bank Matching */}
                <div className="space-y-4">
                  {/* Amount Box */}
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-[#EAE0D5] space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#766E65] font-semibold">
                      Expected Payment Amount
                    </span>
                    <p className="font-serif text-3xl font-bold text-[#452638]">
                      {formatINR(selectedOrderForVerification.totalPaise / 100)}
                    </p>
                    <p className="text-[11px] text-[#766E65]">
                      Exact amount: {selectedOrderForVerification.totalPaise} paise (INR)
                    </p>
                  </div>

                  {/* Customer Details */}
                  <div className="p-4 rounded-2xl border border-[#EAE0D5] space-y-2 text-xs">
                    <p className="font-semibold text-[#452638] uppercase tracking-wider text-[11px]">
                      Customer &amp; Shipping Details
                    </p>
                    <div className="space-y-1 text-[#766E65]">
                      <p className="text-[#282522] font-semibold">{selectedOrderForVerification.customerDetails.fullName}</p>
                      <p>Phone: <span className="font-mono text-[#452638] font-bold">{selectedOrderForVerification.customerDetails.phone}</span></p>
                      {selectedOrderForVerification.customerDetails.email && (
                        <p>Email: {selectedOrderForVerification.customerDetails.email}</p>
                      )}
                      <p className="pt-1 text-[#282522]">
                        {selectedOrderForVerification.customerDetails.addressLine1}
                        {selectedOrderForVerification.customerDetails.addressLine2 ? `, ${selectedOrderForVerification.customerDetails.addressLine2}` : ""}
                      </p>
                      <p>
                        {selectedOrderForVerification.customerDetails.city}, {selectedOrderForVerification.customerDetails.state} — {selectedOrderForVerification.customerDetails.pincode}
                      </p>
                    </div>
                  </div>

                  {/* UTR Input Box */}
                  <div className="p-4 rounded-2xl border-2 border-[#452638]/20 bg-[#452638]/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#452638] uppercase tracking-wider">
                        Submitted UPI UTR / Reference
                      </span>
                      {selectedOrderForVerification.proof?.transactionReference && (
                        <button
                          type="button"
                          onClick={() => handleCopyUtr(selectedOrderForVerification.proof!.transactionReference)}
                          className="px-2 py-1 text-[11px] font-semibold text-[#452638] bg-white border border-[#EAE0D5] rounded-lg hover:bg-neutral-50 flex items-center space-x-1"
                        >
                          {copiedUtr === selectedOrderForVerification.proof?.transactionReference ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy UTR</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {selectedOrderForVerification.proof?.transactionReference ? (
                      <p className="font-mono text-lg font-bold text-[#452638] bg-white p-3 rounded-xl border border-[#EAE0D5] select-all tracking-wider text-center">
                        {selectedOrderForVerification.proof.transactionReference}
                      </p>
                    ) : (
                      <p className="text-xs text-[#766E65] italic bg-white p-3 rounded-xl border border-[#EAE0D5] text-center">
                        Customer has not submitted a transaction reference yet.
                      </p>
                    )}

                    <p className="text-[10px] text-[#766E65]">
                      Search this 12-digit reference number in your HDFC netbanking or mobile app.
                    </p>
                  </div>

                  {/* Ordered Items */}
                  <div className="p-4 rounded-2xl border border-[#EAE0D5] space-y-2 text-xs">
                    <p className="font-semibold text-[#452638] uppercase tracking-wider text-[11px]">
                      Items Ordered ({selectedOrderForVerification.items.reduce((s, i) => s + i.quantity, 0)})
                    </p>
                    <div className="divide-y divide-[#EAE0D5] max-h-36 overflow-y-auto pr-1">
                      {selectedOrderForVerification.items.map((item, idx) => {
                        const name = (item as any).product?.name || (item as any).productName || `Item #${idx + 1}`;
                        const unitPrice = (item as any).product?.price || ((item as any).pricePaise ? (item as any).pricePaise / 100 : 0);
                        const idKey = (item as any).product?.id || (item as any).productId || idx;
                        return (
                          <div key={idKey} className="py-1.5 flex items-center justify-between text-xs">
                            <span className="text-[#452638] font-medium">
                              {name} × {item.quantity}
                            </span>
                            <span className="font-semibold text-[#282522]">
                              {formatINR(unitPrice * item.quantity)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Screenshot Viewer & Verification Actions */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#452638] uppercase tracking-wider">
                        Customer Screenshot Proof
                      </p>
                      {selectedOrderForVerification.proof && (
                        <a
                          href={`/api/orders/${selectedOrderForVerification.orderId}/screenshot?adminPasscode=${getAdminPasscode()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-[#B69A62] hover:underline flex items-center space-x-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Full Size</span>
                        </a>
                      )}
                    </div>

                    {selectedOrderForVerification.proof ? (
                      <div className="relative border-2 border-[#EAE0D5] rounded-2xl overflow-hidden bg-neutral-900/5 min-h-[300px] flex items-center justify-center p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/orders/${selectedOrderForVerification.orderId}/screenshot?adminPasscode=${getAdminPasscode()}`}
                          alt="Submitted Payment Proof"
                          className="max-h-[340px] w-auto object-contain rounded-xl shadow-xs"
                        />
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-[#EAE0D5] rounded-2xl p-10 text-center space-y-2 bg-neutral-50/50">
                        <ImageIcon className="w-10 h-10 text-[#766E65] mx-auto opacity-50" />
                        <p className="text-xs font-semibold text-[#452638]">
                          No screenshot uploaded yet
                        </p>
                        <p className="text-[11px] text-[#766E65]">
                          The customer is on the payment screen or has not yet submitted proof.
                        </p>
                      </div>
                    )}

                    {selectedOrderForVerification.proof && (
                      <div className="text-[11px] text-[#766E65] space-y-0.5 bg-neutral-50 p-3 rounded-xl border border-[#EAE0D5]">
                        <p>Uploaded file: <span className="font-mono text-[#452638]">{selectedOrderForVerification.proof.screenshotFileName}</span></p>
                        <p>Uploaded size: {((selectedOrderForVerification.proof.fileSizeBytes || 0) / 1024).toFixed(1)} KB ({selectedOrderForVerification.proof.screenshotMimeType})</p>
                        <p>Submitted at: {new Date(selectedOrderForVerification.proof.submittedAt).toLocaleString("en-IN")}</p>
                      </div>
                    )}
                  </div>

                  {/* Verification Notes Input */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-[#452638]">
                      Internal Verification Note (saved to audit trail):
                    </label>
                    <textarea
                      value={verificationNoteInput}
                      onChange={(e) => setVerificationNoteInput(e.target.value)}
                      placeholder="e.g. Verified in HDFC Netbanking. Transaction ID matched. Credit received at 14:15."
                      rows={2}
                      className="w-full p-3 bg-white border border-[#EAE0D5] rounded-xl text-xs text-[#282522] focus:outline-none focus:border-[#452638]"
                    />
                  </div>

                  {/* Decision Buttons */}
                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={isVerifying}
                        onClick={() => handleUpdatePaymentStatus(selectedOrderForVerification.orderId, "PAID")}
                        className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Verify &amp; Mark Paid</span>
                      </button>

                      <button
                        type="button"
                        disabled={isVerifying}
                        onClick={() => handleUpdatePaymentStatus(selectedOrderForVerification.orderId, "PAYMENT_REJECTED")}
                        className="w-full py-3 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Reject Payment Proof</span>
                      </button>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        disabled={isVerifying}
                        onClick={() => handleUpdatePaymentStatus(selectedOrderForVerification.orderId, "REFUNDED")}
                        className="text-[11px] text-purple-700 hover:underline font-semibold"
                      >
                        Mark as Refunded
                      </button>

                      <button
                        type="button"
                        disabled={isVerifying}
                        onClick={() => handleUpdatePaymentStatus(selectedOrderForVerification.orderId, "PAYMENT_EXPIRED")}
                        className="text-[11px] text-neutral-500 hover:underline font-semibold"
                      >
                        Mark as Expired
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* Audit Trail Section */}
              <div className="pt-4 border-t border-[#EAE0D5] space-y-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#B69A62]" />
                  <h4 className="font-semibold text-xs text-[#452638] uppercase tracking-wider">
                    Official Verification Audit Trail
                  </h4>
                </div>

                {selectedOrderForVerification.adminAuditLog && selectedOrderForVerification.adminAuditLog.length > 0 ? (
                  <div className="border border-[#EAE0D5] rounded-xl overflow-hidden bg-white text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 text-[#766E65] text-[10px] uppercase font-semibold border-b border-[#EAE0D5]">
                          <th className="p-3">Timestamp</th>
                          <th className="p-3">Administrator</th>
                          <th className="p-3">Action</th>
                          <th className="p-3">Status Transition</th>
                          <th className="p-3">Reason / Internal Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAE0D5]">
                        {selectedOrderForVerification.adminAuditLog.map((log, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50/50">
                            <td className="p-3 font-mono text-[11px] text-[#766E65]">
                              {new Date(log.timestamp).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 font-semibold text-[#452638]">
                              {log.admin}
                            </td>
                            <td className="p-3 font-medium text-[#282522]">
                              {log.action}
                            </td>
                            <td className="p-3">
                              <span className="font-mono text-[10px] bg-neutral-100 px-2 py-0.5 rounded">
                                {log.previousStatus} → {log.newStatus}
                              </span>
                            </td>
                            <td className="p-3 text-[#766E65]">
                              {log.reason || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-[#766E65] italic">
                    No administrative actions recorded on this order yet.
                  </p>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#EAE0D5] bg-neutral-50 flex justify-end flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedOrderForVerification(null)}
                className="px-5 py-2 bg-white border border-[#EAE0D5] text-[#452638] rounded-xl text-xs font-semibold hover:bg-neutral-100 transition-colors"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
