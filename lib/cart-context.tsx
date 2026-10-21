"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, Product, DiscountCoupon } from "./types";
import { AVAILABLE_COUPONS } from "./products-data";
import { calculateOrderTotals, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from "./shipping";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedVariant?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItemsCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  finalTotal: number;
  appliedCoupon: DiscountCoupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<DiscountCoupon | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("aura_cart");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedWishlist = localStorage.getItem("aura_wishlist");
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
      const savedCoupon = localStorage.getItem("aura_coupon");
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error("Failed to load local storage", e);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("aura_cart", JSON.stringify(items));
      localStorage.setItem("aura_wishlist", JSON.stringify(wishlist));
      if (appliedCoupon) {
        localStorage.setItem("aura_coupon", JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem("aura_coupon");
      }
    } catch (e) {
      console.error("Failed to save local storage", e);
    }
  }, [items, wishlist, appliedCoupon, isInitialized]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const addItem = (product: Product, quantity = 1, selectedVariant?: string) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { product, quantity, selectedVariant }];
    });
    showToast(`Added "${product.name}" to your shopping bag.`);
    setIsCartOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast("Removed from your wishlist");
        return prev.filter((id) => id !== productId);
      } else {
        showToast("Saved to your wishlist");
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const totalItemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);

  // Calculate discount
  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.type === "percentage") {
      discount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discount = appliedCoupon.value;
    }
  }

  // Enforce centralized free-shipping threshold on merchandise subtotal after discount
  const totals = calculateOrderTotals(subtotal, discount);
  const shippingFee = totals.shippingFee;
  const finalTotal = totals.finalTotal;

  const applyCoupon = (code: string) => {
    const formatted = code.trim().toUpperCase();
    const matched = AVAILABLE_COUPONS.find((c) => c.code === formatted);

    if (!matched) {
      return { success: false, message: "Invalid promo coupon code." };
    }

    if (subtotal < matched.minOrderValue) {
      return {
        success: false,
        message: `Add ₹${matched.minOrderValue - subtotal} more to apply code "${matched.code}".`,
      };
    }

    setAppliedCoupon(matched);
    showToast(`Code "${matched.code}" applied!`);
    return { success: true, message: `Coupon ${matched.code} successfully applied!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast("Coupon removed.");
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItemsCount,
        subtotal,
        discount,
        shippingFee,
        finalTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isWishlisted,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
