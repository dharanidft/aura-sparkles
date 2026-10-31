"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Truck, 
  Menu, 
  X, 
  Sparkles,
  ArrowRight,
  User,
  LogOut,
  Package,
  MapPin,
  ChevronDown,
  MessageSquare
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

export type AuraFont = "playfair" | "cinzel" | "italiana" | "cormorant" | "montserrat";

export const FONT_MAP: Record<AuraFont, { label: string; family: string; desc: string }> = {
  playfair: { label: "Playfair Display", family: "'Playfair Display', Georgia, serif", desc: "Classic luxury editorial serif with high contrast" },
  cinzel: { label: "Cinzel", family: "'Cinzel', serif", desc: "Roman classical sculptural serif with timeless authority" },
  italiana: { label: "Italiana", family: "'Italiana', serif", desc: "High-fashion Italian couture calligraphy & elegance" },
  cormorant: { label: "Cormorant Garamond", family: "'Cormorant Garamond', Georgia, serif", desc: "Delicate, graceful old-style serif with poetic warmth" },
  montserrat: { label: "Montserrat", family: "'Montserrat', sans-serif", desc: "Clean geometric modern aesthetic with crisp clarity" },
};

export const FONT_LIST: AuraFont[] = ["playfair", "cinzel", "italiana", "cormorant", "montserrat"];

export function Header() {
  const pathname = usePathname();
  const { totalItemsCount, setIsCartOpen, wishlist } = useCart();
  const { customer, isAuthenticated, openAuthModal, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [badgeBump, setBadgeBump] = useState(false);
  const prevCount = useRef(totalItemsCount);

  useEffect(() => {
    if (totalItemsCount > prevCount.current) {
      setBadgeBump(true);
      const timer = setTimeout(() => setBadgeBump(false), 300);
      return () => clearTimeout(timer);
    }
    prevCount.current = totalItemsCount;
  }, [totalItemsCount]);

  useEffect(() => {
    const applySavedFont = () => {
      const saved = (localStorage.getItem("aura_font") as AuraFont) || "playfair";
      if (FONT_MAP[saved]) {
        document.documentElement.setAttribute("data-font", saved);
        document.body.setAttribute("data-font", saved);
        document.documentElement.style.setProperty("--font-heading", FONT_MAP[saved].family);
      }
    };
    applySavedFont();
    window.addEventListener("storage", applySavedFont);
    return () => window.removeEventListener("storage", applySavedFont);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setAccountMenuOpen(false);
  }, [pathname]);

  const desktopNavLinks = [
    { label: "Shop All", href: "/shop" },
    { label: "Candles", href: "/shop?category=Scented+Candles" },
    { label: "Wax Sachets", href: "/shop?category=Wax+Sachets" },
    { label: "Casting Decor", href: "/shop?category=Casting+Decor" },
    { label: "Pop Art Kits", href: "/shop?category=Pop+Art+Kits" },
    { label: "Corporate Gifting", href: "/corporate-gifting" },
    { label: "Our Story", href: "/story" },
    { label: "Contact", href: "/contact" },
  ];

  const mobileNavLinks = [
    { label: "Home", href: "/" },
    ...desktopNavLinks,
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#EAE0D5]"
            : "bg-white border-b border-[#EAE0D5]/40"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-[#452638] hover:text-[#B69A62] transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-3 group" title="Aura Sparkles Home">
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white shadow-xs border border-[#B69A62]/30 group-hover:border-[#B69A62] transition-colors p-0.5">
                  <Image
                    src="/images/logo.png"
                    alt="Aura Sparkles Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-xl sm:text-2xl tracking-[0.16em] font-medium text-[#452638] uppercase">
                    AURA
                  </span>
                  <span className="text-[9px] sm:text-[10px] tracking-[0.24em] text-[#B69A62] font-semibold uppercase -mt-1">
                    SPARKLES
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 flex-shrink-0">
              {desktopNavLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`text-[11px] xl:text-xs uppercase tracking-[0.14em] font-medium transition-colors hover:text-[#452638] relative py-1 whitespace-nowrap ${
                      isActive ? "text-[#452638] font-semibold" : "text-[#766E65]"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B69A62] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-4">
              {/* Search Toggle */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search fragrances"
                className="p-2 text-[#452638] hover:text-[#B69A62] transition-colors relative"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Requirement 6: Customer Order Tracking (Replaces Admin Link in customer header) */}
              <Link
                href="/track-order"
                aria-label="Track Your Order"
                className="p-2 text-[#452638] hover:text-[#B69A62] transition-colors hidden sm:block"
                title="Track Your Order"
              >
                <Truck className="w-5 h-5" />
              </Link>

              {/* Wishlist */}
              <Link
                href="/shop?filter=wishlist"
                aria-label="Saved Wishlist"
                className="p-2 text-[#452638] hover:text-[#B69A62] transition-colors relative"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E8C9C5] text-[#452638] text-[9px] font-bold flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Customer Account / Profile Menu */}
              <div className="relative">
                {isAuthenticated ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                      className="flex items-center space-x-1.5 p-1 sm:p-1.5 text-[#452638] hover:text-[#B69A62] transition-colors rounded-full hover:bg-[#FBF8F3]"
                      aria-label="Customer account menu"
                      aria-expanded={accountMenuOpen}
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#452638] text-white flex items-center justify-center text-xs font-semibold tracking-wider shadow-xs">
                        {(customer?.displayName?.charAt(0) || customer?.email?.charAt(0) || "U").toUpperCase()}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 hidden sm:block text-[#766E65]" />
                    </button>

                    {accountMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EAE0D5] py-2 z-50 animate-popover-in">
                        <div className="px-4 py-3 border-b border-[#EAE0D5]/60 bg-[#FBF8F3]/60 rounded-t-2xl">
                          <p className="text-[10px] uppercase tracking-wider text-[#B69A62] font-semibold">Signed in as</p>
                          <p className="text-sm font-semibold text-[#452638] truncate">{customer?.displayName || customer?.email || "Aura Customer"}</p>
                          <p className="text-xs text-[#766E65] truncate">{customer?.email || customer?.phoneNumber}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/account"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-xs font-medium text-[#452638] hover:bg-[#FBF8F3] hover:text-[#B69A62] transition-colors"
                          >
                            <User className="w-4 h-4 mr-3 text-[#B69A62]" />
                            My Account
                          </Link>
                          <Link
                            href="/account?tab=orders"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-xs font-medium text-[#452638] hover:bg-[#FBF8F3] hover:text-[#B69A62] transition-colors"
                          >
                            <Package className="w-4 h-4 mr-3 text-[#B69A62]" />
                            My Orders
                          </Link>
                          <Link
                            href="/account?tab=addresses"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-xs font-medium text-[#452638] hover:bg-[#FBF8F3] hover:text-[#B69A62] transition-colors"
                          >
                            <MapPin className="w-4 h-4 mr-3 text-[#B69A62]" />
                            My Addresses
                          </Link>
                        </div>

                        <div className="border-t border-[#EAE0D5]/60 pt-1 mt-1">
                          <button
                            type="button"
                            onClick={async () => {
                              setAccountMenuOpen(false);
                              await logout();
                            }}
                            className="w-full flex items-center px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Log Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openAuthModal()}
                    aria-label="Customer Login"
                    className="p-2 text-[#452638] hover:text-[#B69A62] transition-colors"
                    title="Sign In / Register"
                  >
                    <User className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Shopping Bag Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label="View shopping bag"
                className="p-2 text-[#452638] hover:text-[#B69A62] transition-all active:scale-95 relative flex items-center min-w-[44px] min-h-[44px] justify-center"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 transition-transform duration-200" />
                  {totalItemsCount > 0 && (
                    <span 
                      key={totalItemsCount}
                      className={`absolute -top-1.5 -right-2 bg-[#452638] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white transition-all duration-300 ${
                        badgeBump ? "animate-cart-bump shadow-[0_0_8px_rgba(182,154,98,0.5)]" : ""
                      }`}
                    >
                      {totalItemsCount}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="border-t border-[#EAE0D5] bg-white py-4 px-4 sm:px-6 lg:px-8 transition-all animate-fadeIn">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="w-5 h-5 text-[#766E65] absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by fragrance (e.g. Sandalwood, Vanilla, Rose, Mogra)..."
                  className="w-full pl-12 pr-28 py-3 bg-white border border-[#E8C9C5] rounded-full text-sm focus:outline-none focus:border-[#452638] focus:ring-1 focus:ring-[#452638] text-[#282522]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 bg-[#452638] hover:bg-[#5D354D] text-white text-xs uppercase tracking-wider px-5 py-2 rounded-full transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Slide-Out Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)} 
          />

          <div className="relative w-4/5 max-w-sm bg-white h-[100dvh] shadow-2xl flex flex-col z-10 animate-slideRight overscroll-contain pb-[env(safe-area-inset-bottom,0px)]">
            <div className="p-6 border-b border-[#EAE0D5] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white shadow-xs border border-[#B69A62]/40 p-0.5">
                  <Image src="/images/logo.png" alt="Aura Sparkles Logo" fill className="object-contain" />
                </div>
                <div>
                  <span className="font-serif text-lg tracking-luxury font-medium text-[#452638] uppercase">
                    AURA SPARKLES
                  </span>
                  <p className="text-[10px] text-[#766E65] tracking-wide">Pure · Elegant · You</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#452638] hover:text-[#B69A62]"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              <p className="text-[10px] uppercase tracking-luxury text-[#B69A62] font-semibold">
                Menu &amp; Collections
              </p>
              <div className="flex flex-col space-y-3">
                {mobileNavLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-sm uppercase tracking-wider font-medium text-[#452638] border-b border-[#EAE0D5]/50 hover:text-[#B69A62]"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 text-[#B69A62]" />
                  </Link>
                ))}
              </div>

              {/* Customer Account & Orders */}
              <div className="pt-4 border-t border-[#EAE0D5] space-y-3">
                <p className="text-[10px] uppercase tracking-luxury text-[#B69A62] font-semibold">
                  Customer Account &amp; Orders
                </p>

                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-[#FBF8F3] rounded-xl border border-[#EAE0D5]">
                      <p className="text-xs font-semibold text-[#452638] truncate">{customer?.displayName || customer?.email || "Aura Customer"}</p>
                      <p className="text-[11px] text-[#766E65] truncate">{customer?.email || customer?.phoneNumber}</p>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2.5 py-1.5 text-xs text-[#452638] hover:text-[#B69A62]"
                    >
                      <User className="w-4 h-4 text-[#B69A62]" />
                      <span>My Account Dashboard</span>
                    </Link>

                    <Link
                      href="/account?tab=orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2.5 py-1.5 text-xs text-[#452638] hover:text-[#B69A62]"
                    >
                      <Package className="w-4 h-4 text-[#B69A62]" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      href="/account?tab=addresses"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2.5 py-1.5 text-xs text-[#452638] hover:text-[#B69A62]"
                    >
                      <MapPin className="w-4 h-4 text-[#B69A62]" />
                      <span>Saved Addresses</span>
                    </Link>

                    <button
                      type="button"
                      onClick={async () => {
                        setMobileMenuOpen(false);
                        await logout();
                      }}
                      className="flex items-center space-x-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal();
                    }}
                    className="w-full min-h-[48px] py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-wider font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-xs active:scale-[0.99] transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-200" />
                    <span>Sign In with WhatsApp OTP</span>
                  </button>
                )}

                <Link
                  href="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 pt-2 text-xs text-[#452638] hover:text-[#B69A62]"
                >
                  <Truck className="w-4 h-4 text-[#B69A62]" />
                  <span>Track Your Order</span>
                </Link>
              </div>
            </div>

            <div className="p-6 border-t border-[#EAE0D5] bg-white">
              <div className="flex items-center justify-between text-xs text-[#766E65]">
                <span>Currency: INR (₹)</span>
                <span className="flex items-center text-[#452638] font-medium">
                  <Sparkles className="w-3 h-3 text-[#B69A62] mr-1" /> Handcrafted in India
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
