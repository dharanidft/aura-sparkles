"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Customer, CustomerAddress } from "./customer-types";

interface AuthContextType {
  customer: Customer | null;
  isLoading: boolean;
  addresses: CustomerAddress[];
  defaultAddress: CustomerAddress | null;
  refreshCustomer: () => Promise<void>;
  sendOtp: (phoneNumber: string, countryCode?: string) => Promise<{ success: boolean; waitSeconds?: number; error?: string }>;
  verifyOtp: (phoneNumber: string, otpCode: string, displayName?: string, countryCode?: string) => Promise<{ success: boolean; isNewCustomer?: boolean; error?: string }>;
  logout: () => Promise<void>;
  saveAddress: (addressData: Partial<CustomerAddress>) => Promise<{ success: boolean; address?: CustomerAddress; error?: string }>;
  deleteAddress: (addressId: string) => Promise<{ success: boolean; error?: string }>;
  setDefaultAddress: (addressId: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (displayName: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  isAuthModalOpen: boolean;
  authModalRedirect: string | null;
  openAuthModal: (redirectUrl?: string) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRedirect, setAuthModalRedirect] = useState<string | null>(null);

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;

  const refreshCustomer = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.customer) {
          setCustomer(data.customer);
          setAddresses(data.addresses || []);
        } else {
          setCustomer(null);
          setAddresses([]);
        }
      } else {
        setCustomer(null);
        setAddresses([]);
      }
    } catch (err) {
      console.error("[Auth Context] Error loading customer profile:", err);
      setCustomer(null);
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCustomer();
  }, [refreshCustomer]);

  const openAuthModal = (redirectUrl?: string) => {
    if (redirectUrl) {
      setAuthModalRedirect(redirectUrl);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const sendOtp = async (phoneNumber: string, countryCode = "+91") => {
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, countryCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to send OTP.", waitSeconds: data.waitSeconds };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error. Please try again." };
    }
  };

  const verifyOtp = async (phoneNumber: string, otpCode: string, displayName?: string, countryCode = "+91") => {
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otpCode, displayName, countryCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Invalid OTP code." };
      }
      setCustomer(data.customer);
      setAddresses(data.addresses || []);
      setIsAuthModalOpen(false);
      return { success: true, isNewCustomer: data.isNewCustomer };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("[Auth Context] Logout error:", err);
    } finally {
      setCustomer(null);
      setAddresses([]);
      window.location.href = "/";
    }
  };

  const saveAddress = async (addressData: Partial<CustomerAddress>) => {
    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to save address." };
      }
      if (data.addresses) {
        setAddresses(data.addresses);
      }
      return { success: true, address: data.address };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error." };
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      const res = await fetch(`/api/customer/addresses/${addressId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to delete address." };
      }
      if (data.addresses) {
        setAddresses(data.addresses);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error." };
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    try {
      const res = await fetch(`/api/customer/addresses/${addressId}/default`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to set default address." };
      }
      if (data.addresses) {
        setAddresses(data.addresses);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error." };
    }
  };

  const updateProfile = async (displayName: string, email?: string) => {
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to update profile." };
      }
      if (data.customer) {
        setCustomer(data.customer);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error." };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isLoading,
        addresses,
        defaultAddress,
        refreshCustomer,
        sendOtp,
        verifyOtp,
        logout,
        saveAddress,
        deleteAddress,
        setDefaultAddress,
        updateProfile,
        isAuthModalOpen,
        authModalRedirect,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
