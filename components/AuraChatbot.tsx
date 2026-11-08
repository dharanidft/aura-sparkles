"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, 
  X, 
  Minus, 
  Send, 
  RotateCcw, 
  MessageCircle, 
  ArrowRight, 
  ExternalLink,
  Flame,
  ChevronRight,
  ShoppingBag
} from "lucide-react";
import { 
  BotMessage, 
  BotProductRecommendation, 
  getInitialWelcomeMessage, 
  processChatbotAction, 
  processChatbotUserInput 
} from "@/lib/aura-bot/skills";
import { formatINR } from "@/lib/shipping";

export function AuraChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<BotMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Restore chat state from sessionStorage or initialize welcome
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("aura_chatbot_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {}
    setMessages([getInitialWelcomeMessage()]);
  }, []);

  // Save chat history to sessionStorage on update
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem("aura_chatbot_history", JSON.stringify(messages));
      } catch {}
    }
  }, [messages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized]);

  // Handle escape to close
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasUnread(false);
  };

  const handleReset = () => {
    const welcome = getInitialWelcomeMessage();
    setMessages([welcome]);
    try {
      sessionStorage.removeItem("aura_chatbot_history");
    } catch {}
  };

  const handleQuickAction = (action: string, payload?: string) => {
    if (action === "open_whatsapp_external") {
      const waUrl = `https://wa.me/919840022902?text=${encodeURIComponent(
        "Hi Aura Sparkles team! I'm reaching out from your website chatbot for guidance on fragrances and orders."
      )}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (action === "nav_track_order") {
      window.location.href = "/track-order";
      return;
    }

    if (action === "nav_corporate_gifting") {
      window.location.href = "/corporate-gifting";
      return;
    }

    if (action === "nav_shop_all") {
      window.location.href = "/shop";
      return;
    }

    if (action === "nav_shop_candles") {
      window.location.href = "/collections/candles";
      return;
    }

    if (action === "nav_shop_sachets") {
      window.location.href = "/collections/wax-sachets";
      return;
    }

    // Process skill engine action
    setIsTyping(true);
    setTimeout(() => {
      const botReply = processChatbotAction(action, payload);
      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 350);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const userMsg: BotMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const botReply = processChatbotUserInput(text);
      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <>
      {/* ─── Floating Launcher Button ─────────────────────────────────────────── */}
      {!isOpen && (
        <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 select-none">
          <button
            onClick={handleOpen}
            aria-label="Open Aura Concierge Chat"
            className="group relative flex items-center space-x-2.5 px-4 py-3 bg-[#452638] hover:bg-[#5D354D] text-[#FAF7F2] rounded-full shadow-luxury hover:shadow-2xl transition-all duration-300 transform active:scale-95 border border-[#B69A62]/40"
          >
            {/* Pulsing online status indicator */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>

            {/* Icon */}
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[#B69A62] group-hover:rotate-12 transition-transform duration-300">
              <Sparkles className="w-3.5 h-3.5" />
            </div>

            {/* Label */}
            <div className="text-left pr-1">
              <p className="text-[11px] font-semibold tracking-[0.14em] uppercase leading-tight font-serif text-[#FAF7F2]">
                Ask Aura
              </p>
              <p className="text-[9px] text-[#B69A62] font-sans tracking-wide leading-tight">
                Atelier Concierge
              </p>
            </div>

            {/* Unread indicator */}
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#B69A62] border-2 border-white rounded-full" />
            )}
          </button>
        </div>
      )}

      {/* ─── Chat Window Overlay ──────────────────────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Aura Atelier Concierge Chat"
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? "bottom-5 right-4 sm:bottom-6 sm:right-6 w-72 h-14"
              : "inset-x-0 bottom-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[390px] h-[85vh] sm:h-[580px] max-h-[620px]"
          }`}
        >
          <div className="w-full h-full bg-white rounded-t-3xl sm:rounded-2xl border border-[#EAE0D5] shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
            
            {/* ─── Header ──────────────────────────────────────────────────────── */}
            <div className="bg-[#452638] text-[#FAF7F2] px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between border-b border-[#B69A62]/30 select-none">
              <div className="flex items-center space-x-2.5">
                <div className="relative w-8 h-8 rounded-full bg-white/10 border border-[#B69A62]/40 p-0.5 flex items-center justify-center text-[#B69A62]">
                  <Sparkles className="w-4 h-4 text-[#B69A62]" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-serif text-sm font-medium tracking-wide text-white">
                      Aura · Concierge
                    </h3>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-[10px] text-[#FAF7F2]/70 font-sans">
                    Hand-poured Studio · Chennai
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleReset}
                  title="Restart chat"
                  className="p-1.5 text-[#FAF7F2]/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? "Expand" : "Minimize"}
                  className="p-1.5 text-[#FAF7F2]/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-1.5 text-[#FAF7F2]/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ─── Body (When not minimized) ────────────────────────────────────── */}
            {!isMinimized && (
              <>
                {/* Scrollable Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FAF7F2]/40 text-xs">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Bubble */}
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-line shadow-xs ${
                          msg.sender === "user"
                            ? "bg-[#452638] text-[#FAF7F2] rounded-br-none"
                            : "bg-white text-[#282522] border border-[#EAE0D5] rounded-bl-none"
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>

                      {/* Product Recommendations Card Carousel */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="w-full mt-3 space-y-2.5">
                          {msg.products.map((prod) => (
                            <div
                              key={prod.slug}
                              className="bg-white rounded-xl border border-[#EAE0D5] p-2.5 flex items-center space-x-3 shadow-xs hover:border-[#B69A62]/40 transition-all group"
                            >
                              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#FAF7F2] flex-shrink-0 border border-[#EAE0D5]">
                                <Image
                                  src={prod.image}
                                  alt={prod.name}
                                  fill
                                  className="object-contain p-1"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] uppercase tracking-luxury text-[#B69A62] font-semibold block truncate">
                                  {prod.category}
                                </span>
                                <h4 className="font-serif text-xs text-[#452638] font-medium truncate group-hover:text-[#B69A62] transition-colors">
                                  {prod.name}
                                </h4>
                                <p className="text-[10px] text-[#766E65] truncate">
                                  {prod.highlight}
                                </p>
                                <div className="flex items-center space-x-1.5 mt-0.5">
                                  <span className="font-semibold text-xs text-[#452638]">
                                    {formatINR(prod.price)}
                                  </span>
                                  {prod.originalPrice && (
                                    <span className="text-[10px] text-[#766E65] line-through">
                                      {formatINR(prod.originalPrice)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Link
                                href={`/shop/${prod.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="px-2.5 py-1.5 bg-[#452638] hover:bg-[#5D354D] text-[#FAF7F2] rounded-lg text-[10px] font-semibold uppercase tracking-luxury flex-shrink-0 flex items-center space-x-1 transition-all"
                              >
                                <span>View</span>
                                <ChevronRight className="w-3 h-3" />
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quick Action Skill Pills */}
                      {msg.quickActions && msg.quickActions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[95%]">
                          {msg.quickActions.map((qa) => (
                            <button
                              key={qa.label}
                              onClick={() => handleQuickAction(qa.action, qa.payload)}
                              className="px-3 py-1.5 bg-white hover:bg-[#FAF7F2] border border-[#EAE0D5] hover:border-[#B69A62] text-[#452638] text-[11px] font-medium rounded-full shadow-2xs transition-all flex items-center space-x-1 active:scale-95"
                            >
                              <span>{qa.label}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Timestamp */}
                      <span className="text-[9px] text-[#766E65]/60 mt-1 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-center space-x-1.5 bg-white border border-[#EAE0D5] px-3.5 py-2.5 rounded-2xl rounded-bl-none w-max shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B69A62] animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B69A62] animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B69A62] animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* ─── Footer Input Bar ────────────────────────────────────────────── */}
                <div className="p-3 bg-white border-t border-[#EAE0D5] space-y-2">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Ask Aura about scents, gifts, tracking..."
                      className="flex-1 bg-[#FAF7F2] border border-[#EAE0D5] rounded-xl px-3.5 py-2 text-xs text-[#282522] placeholder:text-[#766E65]/60 focus:outline-hidden focus:border-[#B69A62] focus:bg-white transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="p-2 bg-[#452638] hover:bg-[#5D354D] disabled:opacity-40 text-[#FAF7F2] rounded-xl transition-all flex-shrink-0"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4 text-[#B69A62]" />
                    </button>
                  </form>

                  {/* WhatsApp Quick Concierge Bar */}
                  <div className="flex items-center justify-between text-[10px] text-[#766E65] pt-0.5 px-1">
                    <span className="flex items-center text-[10px]">
                      <Sparkles className="w-3 h-3 text-[#B69A62] mr-1" />
                      Instant AI Knowledge
                    </span>
                    <a
                      href={`https://wa.me/919840022902?text=${encodeURIComponent(
                        "Hello Aura Sparkles! I would like personal assistance from your Chennai atelier."
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
}

