"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Copy,
  Check,
  Sparkles,
  Info,
  ShieldCheck,
  User,
  Mail,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";

export default function DemoCardWidget({
  customerName = "",
  setCustomerName,
  customerEmail = "",
  setCustomerEmail,
  customerPhone = "",
  setCustomerPhone,
}) {
  const [copiedField, setCopiedField] = useState(null);

  const DEMO_CARD = {
    number: "4242 4242 4242 4242",
    rawNumber: "4242424242424242",
    expiry: "12/28",
    cvc: "424",
    brand: "VISA Test Card",
  };

  const copyToClipboard = (text, fieldName, label) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${label} copied to clipboard.`);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const copyAllDetails = () => {
    const allInfo = `Card: ${DEMO_CARD.rawNumber}\nExpiry: ${DEMO_CARD.expiry}\nCVC: ${DEMO_CARD.cvc}`;
    navigator.clipboard.writeText(allInfo);
    setCopiedField("all");
    toast.success("All test card credentials copied.");
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  return (
    <div className="w-full space-y-5">
      {/* Sandbox Alert Header */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs">
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles size={16} className="text-amber-500 shrink-0" />
          <span>Stripe Sandbox / Test Mode Active</span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-300">
          Demo Card Included
        </span>
      </div>

      {/* Visual Credit Card Preview */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border border-white/20 p-6 text-white shadow-xl shadow-indigo-950/20 transition-transform duration-300 hover:scale-[1.01]">
        {/* Subtle Decorative Background Glow */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[var(--brand)]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        {/* Card Header: Chip & Visa Logo */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {/* Golden Chip Graphic */}
            <div className="w-10 h-8 rounded-md bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 border border-amber-200/50 shadow-sm flex items-center justify-center">
              <div className="w-6 h-5 border border-amber-700/30 rounded-sm grid grid-cols-2 gap-0.5 opacity-60">
                <div className="border-r border-b border-amber-700/30" />
                <div className="border-b border-amber-700/30" />
                <div className="border-r border-amber-700/30" />
                <div />
              </div>
            </div>
            {/* Contactless waves */}
            <span className="text-white/60 text-xs font-mono">)))</span>
          </div>

          <div className="text-right">
            <span className="text-xs font-black tracking-wider uppercase text-white/90">
              VISA <span className="text-[10px] text-amber-400 font-semibold">TEST</span>
            </span>
          </div>
        </div>

        {/* Card Number with 1-Click Copy */}
        <div className="relative z-10 mb-5">
          <p className="text-[10px] uppercase font-bold tracking-wider text-white/60 mb-1 flex items-center justify-between">
            <span>Demo Card Number</span>
            <button
              type="button"
              onClick={() => copyToClipboard(DEMO_CARD.rawNumber, "number", "Card Number")}
              className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors font-medium cursor-pointer"
            >
              {copiedField === "number" ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedField === "number" ? "Copied" : "Copy"}</span>
            </button>
          </p>
          <p className="text-xl sm:text-2xl font-mono font-bold tracking-widest text-white select-all">
            {DEMO_CARD.number}
          </p>
        </div>

        {/* Card Footer: Holder, Expiry, CVC */}
        <div className="relative z-10 grid grid-cols-12 gap-2 items-end pt-2 border-t border-white/10 text-xs">
          {/* Holder Name */}
          <div className="col-span-6">
            <p className="text-[9px] uppercase tracking-wider text-white/50">Cardholder Name</p>
            <p className="font-semibold uppercase tracking-wider truncate text-white/90">
              {customerName?.trim() ? customerName.trim() : "YOUR NAME"}
            </p>
          </div>

          {/* Expiry Date */}
          <div className="col-span-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider text-white/50">Expires</span>
              <button
                type="button"
                onClick={() => copyToClipboard(DEMO_CARD.expiry, "expiry", "Expiry Date")}
                className="text-amber-400 hover:text-amber-300 text-[10px] p-0.5 cursor-pointer"
                title="Copy Expiry"
              >
                {copiedField === "expiry" ? <Check size={10} /> : <Copy size={10} />}
              </button>
            </div>
            <p className="font-mono font-bold text-white/90 select-all">{DEMO_CARD.expiry}</p>
          </div>

          {/* CVC */}
          <div className="col-span-3 text-right">
            <div className="flex items-center justify-end gap-1">
              <span className="text-[9px] uppercase tracking-wider text-white/50">CVC</span>
              <button
                type="button"
                onClick={() => copyToClipboard(DEMO_CARD.cvc, "cvc", "CVC")}
                className="text-amber-400 hover:text-amber-300 text-[10px] p-0.5 cursor-pointer"
                title="Copy CVC"
              >
                {copiedField === "cvc" ? <Check size={10} /> : <Copy size={10} />}
              </button>
            </div>
            <p className="font-mono font-bold text-white/90 select-all">{DEMO_CARD.cvc}</p>
          </div>
        </div>
      </div>

      {/* Copy All Shortcut Action Button */}
      <div className="flex justify-between items-center px-1">
        <span className="text-[11px] text-foreground/60 flex items-center gap-1.5">
          <Info size={13} className="text-[var(--brand)]" />
          Click any field to copy credentials instantly.
        </span>
        <button
          type="button"
          onClick={copyAllDetails}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--hover-bg)] hover:bg-[var(--brand)]/15 border border-border-line text-xs font-semibold text-foreground transition-all cursor-pointer"
        >
          {copiedField === "all" ? (
            <>
              <Check size={13} className="text-emerald-500" />
              <span>Copied All</span>
            </>
          ) : (
            <>
              <Copy size={13} className="text-[var(--brand)]" />
              <span>Copy All Card Info</span>
            </>
          )}
        </button>
      </div>

      {/* User Information Form: User enters Name, Email & Phone */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border-line space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <User size={14} className="text-[var(--brand)]" />
            <span>Customer Details (Your Personal Info)</span>
          </h3>
          <p className="text-[11px] text-foreground/60 mt-0.5">
            Cardholder name, email, and phone number are entered by you.
          </p>
        </div>

        <div className="space-y-3">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-semibold text-foreground/70 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40"
              />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName && setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-line bg-background text-foreground text-xs focus:outline-none focus:border-[var(--brand)] transition-colors"
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-semibold text-foreground/70 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40"
              />
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail && setCustomerEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-line bg-background text-foreground text-xs focus:outline-none focus:border-[var(--brand)] transition-colors"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-[11px] font-semibold text-foreground/70 mb-1">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40"
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone && setCustomerPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-line bg-background text-foreground text-xs focus:outline-none focus:border-[var(--brand)] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Security assurance */}
        <div className="pt-2 border-t border-border-line flex items-center gap-2 text-[11px] text-foreground/50">
          <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
          <span>Your information is encrypted and securely transmitted via Stripe.</span>
        </div>
      </div>
    </div>
  );
}
