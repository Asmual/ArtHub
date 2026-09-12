"use client";

import React, { useState } from "react";
import {
  Mail,
  MessageSquare,
  Send,
  MapPin,
  Clock,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ContactSupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitted(true);
    toast.success("Thank you! Your message has been received. Our support team will reply shortly.");
  };

  return (
    <div
      className="min-h-screen bg-[var(--background)] text-[var(--text-main)] py-10 sm:py-16"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="w-[95%] sm:w-[94%] lg:w-[92%] 2xl:w-[90%] mx-auto max-w-5xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand)]/10 text-[#df6742] text-xs font-bold uppercase tracking-wider">
            <MessageSquare size={14} />
            <span>Customer Care &amp; Curator Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-main)] tracking-tight">
            Contact <span className="text-[#df6742]">ArtHub Support</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto">
            Have a question about an artwork purchase, artist membership, or collector inquiry? We are here to help you every step of the way.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Channels */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-line)] shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)]">
                Direct Communication
              </h3>

              <div className="flex items-start gap-3 text-xs">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-[#df6742] flex items-center justify-center shrink-0 border border-orange-500/20">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="font-bold text-[var(--text-main)] block">Email Inquiries</span>
                  <span className="text-[var(--text-muted)]">support@arthub.gallery</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-[#df6742] flex items-center justify-center shrink-0 border border-orange-500/20">
                  <Clock size={18} />
                </div>
                <div>
                  <span className="font-bold text-[var(--text-main)] block">Curator Hours</span>
                  <span className="text-[var(--text-muted)]">Monday – Saturday: 9:00 AM – 8:00 PM (EST)</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-[#df6742] flex items-center justify-center shrink-0 border border-orange-500/20">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="font-bold text-[var(--text-main)] block">Global Headquarters</span>
                  <span className="text-[var(--text-muted)]">ArtHub Fine Art Ecosystem, Digital Global Network</span>
                </div>
              </div>
            </div>

            {/* Quick FAQ note */}
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-line)] shadow-sm space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
                <HelpCircle size={14} className="text-[#df6742]" />
                <span>Common Inquiries</span>
              </h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                For questions regarding artwork delivery or Stripe checkout confirmation, tracking links are dispatched directly to your registered buyer email upon purchase verification.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border-line)] shadow-lg">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-main)]">Message Dispatched</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-sm mx-auto">
                    Thank you for reaching out to ArtHub. Our dedicated curator team will respond to {email} within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setMessage("");
                      setSubject("");
                    }}
                    className="px-5 py-2 rounded-xl bg-[var(--hover-bg)] text-xs font-bold text-[var(--text-main)] hover:text-[#df6742] transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-base font-bold text-[var(--text-main)] border-b border-[var(--border-line)] pb-3">
                    Send Us a Message
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--text-main)]">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border-line)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#df6742]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--text-main)]">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border-line)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#df6742]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-main)]">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Artwork inquiry, subscription question, feedback..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border-line)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#df6742]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-main)]">
                      Your Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can our curator or technical team assist you?"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border-line)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#df6742] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-[#df6742] hover:bg-[#c55332] text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-[#df6742]/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Transmit Message</span>
                    <Send size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
