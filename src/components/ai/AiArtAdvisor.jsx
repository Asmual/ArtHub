/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import AppSpinner from "@/components/shared/AppSpinner";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  RotateCcw,
  Palette,
  Maximize2,
  Minimize2,
} from "lucide-react";

const STARTER_PROMPTS = [
  "🎨 Vibrant art for a modern living room",
  "✨ Best abstract paintings under $200",
  "🌿 Serene & calming nature art for bedroom",
  "🏛️ Classical oil paintings with dark backgrounds",
];

export default function AiArtAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      sender: "ai",
      text: "Hello! I am your personal **ArtHub AI Curator** powered by Gemini. \n\nTell me about your space—what colors are your walls, which room are you styling, or what mood or budget do you have in mind?",
      suggestedPrompts: STARTER_PROMPTS,
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const msgCounter = useRef(1);

  const getMsgId = (prefix) => {
    msgCounter.current += 1;
    return `${prefix}-${msgCounter.current}`;
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (customPrompt) => {
    const promptToSend = (customPrompt || inputMessage).trim();
    if (!promptToSend || loading) return;

    const userMsg = {
      id: getMsgId("user"),
      sender: "user",
      text: promptToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      // 1. Try internal Next.js route first
      let advisorData = null;
      try {
        const res = await fetch("/api/ai/art-advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg],
            userPrompt: promptToSend,
          }),
        });
        if (res.ok) {
          const resJson = await res.json();
          if (resJson.success) advisorData = resJson.data;
        }
      } catch (localErr) {
        console.warn("Local AI advisor route skipped, trying external gateway:", localErr);
      }

      // 2. Fallback to external Express backend if needed
      if (!advisorData) {
        const serverBase = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
        const res = await fetch(`${serverBase}/api/ai/art-advisor`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg],
            userPrompt: promptToSend,
          }),
        });
        if (res.ok) {
          const resJson = await res.json();
          if (resJson.success) advisorData = resJson.data;
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to query AI curator.");
        }
      }

      if (advisorData) {
        const aiMsg = {
          id: getMsgId("ai"),
          sender: "ai",
          text: advisorData.reply || "Here are my personalized artwork recommendations:",
          recommendedArtworks: advisorData.recommendedArtworks || [],
          suggestedPrompts: advisorData.suggestedPrompts || [],
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error("AI Advisor error:", err);
      const errorMsg = {
        id: getMsgId("ai-err"),
        sender: "ai",
        text: "I apologize, but I encountered a momentary connection issue. Please feel free to rephrase or try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome-fresh",
        sender: "ai",
        text: "Fresh canvas! Tell me about the room, style, or color palette you'd like art recommendations for.",
        suggestedPrompts: STARTER_PROMPTS,
      },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#df6742] via-orange-500 to-amber-500 hover:from-[#c55332] hover:to-amber-600 text-white font-bold text-xs shadow-xl shadow-[#df6742]/30 active:scale-95 transition-all cursor-pointer"
            aria-label="Open AI Art Advisor"
          >
            {/* Glowing Ambient Halo */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#df6742] to-amber-500 opacity-40 blur-sm group-hover:opacity-75 transition-opacity -z-10" />

            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles size={13} className="text-white animate-spin-slow" />
            </div>

            <span className="tracking-wide">AI Art Advisor</span>

            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          </button>
        </div>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? "bottom-5 right-5 w-72 h-14"
              : "bottom-4 sm:bottom-6 right-3 sm:right-6 w-[94vw] sm:w-[420px] max-w-[440px] h-[580px] max-h-[88vh]"
          } bg-surface border border-border-strong rounded-2xl shadow-2xl flex flex-col overflow-hidden text-foreground`}
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {/* Header Bar */}
          <div className="px-4 py-3 bg-surface border-b border-border-line flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#df6742] to-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Bot size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate">
                  <span>ArtHub AI Curator</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shrink-0">
                    Gemini 3.6
                  </span>
                </h3>
                <p className="text-[10px] text-text-muted truncate">
                  {isMinimized ? "Click maximize to chat" : "Personalized Gallery Recommendations"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {!isMinimized && (
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="p-1.5 rounded-lg text-text-muted hover:text-foreground hover:bg-[var(--hover-bg)] transition-colors"
                  title="Reset conversation"
                  aria-label="Reset conversation"
                >
                  <RotateCcw size={13} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-text-muted hover:text-foreground hover:bg-[var(--hover-bg)] transition-colors"
                title={isMinimized ? "Maximize" : "Minimize"}
                aria-label={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-foreground hover:bg-[var(--hover-bg)] transition-colors"
                title="Close chat"
                aria-label="Close chat"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Chat Body (Hidden when minimized) */}
          {!isMinimized && (
            <>
              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    } gap-1`}
                  >
                    <div className="flex items-end gap-2 max-w-[90%]">
                      {msg.sender === "ai" && (
                        <div className="w-6 h-6 rounded-full bg-[#df6742]/15 text-[#df6742] flex items-center justify-center shrink-0 mb-1">
                          <Bot size={13} />
                        </div>
                      )}

                      <div
                        className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                          msg.sender === "user"
                            ? "bg-[#df6742] text-white rounded-br-xs shadow-sm"
                            : "bg-[var(--hover-bg)] text-foreground border border-border-line rounded-bl-xs shadow-xs"
                        }`}
                      >
                        {msg.text}
                      </div>

                      {msg.sender === "user" && (
                        <div className="w-6 h-6 rounded-full bg-border-line text-foreground/70 flex items-center justify-center shrink-0 mb-1">
                          <User size={13} />
                        </div>
                      )}
                    </div>

                    {/* Recommended Artwork Cards inside message */}
                    {msg.recommendedArtworks && msg.recommendedArtworks.length > 0 && (
                      <div className="w-full pl-8 pt-2 space-y-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#df6742] flex items-center gap-1">
                          <Palette size={11} />
                          <span>Curator Recommended Pieces</span>
                        </span>

                        <div className="grid grid-cols-1 gap-2.5">
                          {msg.recommendedArtworks.map((art, idx) => (
                            <div
                              key={art.id || idx}
                              className="p-2.5 rounded-xl bg-surface border border-border-line hover:border-[#df6742]/50 transition-all flex items-start gap-3 shadow-xs"
                            >
                              {/* Thumbnail */}
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--hover-bg)] border border-border-line shrink-0 relative">
                                {art.image ? (
                                  <img
                                    src={art.image}
                                    alt={art.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-text-subtle">
                                    <Palette size={16} />
                                  </div>
                                )}
                              </div>

                              {/* Details */}
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-bold text-foreground text-xs truncate">
                                    {art.title}
                                  </h4>
                                  <span className="font-extrabold text-[#df6742] text-xs shrink-0">
                                    ${Number(art.price || 0).toFixed(0)}
                                  </span>
                                </div>

                                <p className="text-[10px] text-text-muted truncate">
                                  by {art.artistName || "ArtHub Artist"} · <span className="text-foreground/70 font-medium">{art.category}</span>
                                </p>

                                {art.curatorNote && (
                                  <p className="text-[10px] text-foreground/75 italic line-clamp-2 bg-[var(--hover-bg)] p-1.5 rounded-md border border-border-line">
                                    &ldquo;{art.curatorNote}&rdquo;
                                  </p>
                                )}

                                {/* Action links */}
                                <div className="pt-1 flex items-center gap-2">
                                  {art.id && (
                                    <>
                                      <Link
                                        href={`/browse/${art.id}`}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--hover-bg)] hover:bg-border-line text-foreground text-[10px] font-semibold transition-colors"
                                      >
                                        <span>View Piece</span>
                                        <ExternalLink size={10} />
                                      </Link>
                                      <Link
                                        href={`/checkout?artId=${art.id}`}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#df6742] hover:bg-[#c55332] text-white text-[10px] font-semibold transition-colors"
                                      >
                                        <ShoppingBag size={10} />
                                        <span>Buy Now</span>
                                      </Link>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested Prompt Chips */}
                    {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                      <div className="w-full pl-8 pt-2 flex flex-wrap gap-1.5">
                        {msg.suggestedPrompts.map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => handleSendMessage(suggestion)}
                            className="px-2.5 py-1 rounded-full bg-[var(--hover-bg)] hover:bg-[#df6742]/15 hover:border-[#df6742]/30 border border-border-line text-[11px] text-foreground/80 hover:text-[#df6742] font-medium transition-all text-left cursor-pointer"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading State */}
                {loading && (
                  <div className="flex items-center gap-2 text-xs text-text-muted pl-8">
                    <AppSpinner size="small" />
                    <span>Curating recommendations from gallery...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-surface border-t border-border-line">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    placeholder="Ask about wall colors, rooms, styles, or budget..."
                    className="flex-1 bg-background border border-border-line rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-text-muted/60 focus:outline-none focus:border-[#df6742] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputMessage.trim()}
                    className="p-2.5 rounded-xl bg-[#df6742] hover:bg-[#c55332] disabled:opacity-40 text-white font-bold transition-all shadow-sm cursor-pointer"
                    aria-label="Send message"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
