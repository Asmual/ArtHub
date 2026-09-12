/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Camera,
  Save,
  ShieldCheck,
  RefreshCcw,
  Phone,
  FileText,
  Palette,
  Crown,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import BrandLoader from "@/components/shared/BrandLoader";
import { getAuthToken } from "@/lib/auth-utils";

const ART_SPECIALTIES = [
  "Painting",
  "Digital Art",
  "Sculpture",
  "Photography",
  "Drawing & Sketching",
  "Mixed Media",
  "Ceramics & Pottery",
  "Contemporary Art",
  "Art Collector",
];

export default function ProfileManagement({ role: explicitRole }) {
  const { data: session, isPending: authLoading } = useSession();
  const user = session?.user;

  const role = explicitRole || user?.role || "user";

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Synchronize session baseline data
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.image) setImage(user.image);
    }
  }, [user]);

  // Load enriched profile data from database
  const loadProfile = useCallback(async () => {
    if (!user?.email) return;

    try {
      setInitialLoading(true);
      let profileData = null;

      // 1. Try local Next.js internal API first
      try {
        const localRes = await fetch(`/api/users/profile?email=${encodeURIComponent(user.email)}`);
        if (localRes.ok) {
          profileData = await localRes.json();
        }
      } catch (localErr) {
        console.warn("Local profile fetch skipped, trying external gateway:", localErr);
      }

      // 2. Fallback to external backend if needed
      if (!profileData) {
        const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
        const token = await getAuthToken(user.email);
        const res = await fetch(`${base}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          profileData = await res.json();
        }
      }

      if (profileData) {
        if (profileData.name) setName(profileData.name);
        if (profileData.image) setImage(profileData.image);
        if (profileData.phone) setPhone(profileData.phone);
        if (profileData.bio) setBio(profileData.bio);
        if (profileData.specialty || profileData.speciality) {
          setSpecialty(profileData.specialty || profileData.speciality);
        }
      }
    } catch (err) {
      console.error("[PROFILE ERROR] Failed to load profile:", err);
    } finally {
      setInitialLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!authLoading && user?.email) {
      loadProfile();
    } else if (!authLoading && !user) {
      setInitialLoading(false);
    }
  }, [authLoading, user?.email, loadProfile]);

  // Handle Image Upload via internal upload API
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size must be less than 10MB.");
      return;
    }

    setIsUploading(true);
    const uploadToast = toast.loading("Uploading and saving profile photo...");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.url) {
        const newImageUrl = data.url;
        setImage(newImageUrl);

        // Immediately update BetterAuth session and database
        try {
          await authClient.updateUser({
            image: newImageUrl,
          });

          await fetch("/api/users/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user?.email,
              image: newImageUrl,
            }),
          });
        } catch (syncErr) {
          console.warn("Background profile photo sync notice:", syncErr);
        }

        toast.success("Profile photo updated successfully.", { id: uploadToast });
      } else {
        toast.error(data.message || "Failed to upload image.", { id: uploadToast });
      }
    } catch (error) {
      console.error("[UPLOAD ERROR] Image upload failed:", error);
      toast.error("Network error during photo upload.", { id: uploadToast });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Profile Update across BetterAuth and MongoDB
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return toast.error("Name cannot be empty.");
    }

    setIsUpdating(true);
    const loadingToast = toast.loading("Saving profile changes...");

    try {
      // 1. Update BetterAuth session
      await authClient.updateUser({
        name: name.trim(),
        image: image || undefined,
      });

      const updatePayload = {
        name: name.trim(),
        image: image || "",
        phone: phone.trim(),
        bio: bio.trim(),
        specialty: specialty.trim(),
        email: user?.email,
      };

      // 2. Try updating local Next.js internal API first
      let dbUpdated = false;
      try {
        const localRes = await fetch("/api/users/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });
        if (localRes.ok) {
          dbUpdated = true;
        }
      } catch (localErr) {
        console.warn("Local profile update skipped, trying external gateway:", localErr);
      }

      // 3. Fallback to external backend if needed
      if (!dbUpdated) {
        const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
        const token = await getAuthToken(user.email);
        await fetch(`${base}/api/users/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        });
      }

      toast.success("Profile updated successfully!", { id: loadingToast });
    } catch (error) {
      console.error("[PROFILE ERROR] Profile update error:", error);
      toast.error("Failed to save changes. Please try again.", { id: loadingToast });
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <BrandLoader />
      </div>
    );
  }

  // Role metadata configurations
  const roleConfig = {
    admin: {
      title: "System Administrator",
      subtitle: "Full Root Privileges & Marketplace Governance",
      badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      icon: Crown,
      statLabel: "Clearance Level",
      statValue: "Root Administrator",
    },
    artist: {
      title: "Verified Artist",
      subtitle: "Visual Creator & Gallery Exhibition Contributor",
      badgeClass: "bg-[#df6742]/10 text-[#df6742] border-[#df6742]/20",
      icon: Palette,
      statLabel: "Account Status",
      statValue: "Exhibiting Artist",
    },
    user: {
      title: "Art Collector",
      subtitle: "Verified Collector & ArtHub Community Member",
      badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      icon: UserCheck,
      statLabel: "Account Status",
      statValue: "Active Collector",
    },
  }[role?.toLowerCase()] || {
    title: "Community Member",
    subtitle: "ArtHub Registered Profile",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: User,
    statLabel: "Account Status",
    statValue: "Active Member",
  };

  const RoleIcon = roleConfig.icon;

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Profile Identity Card (No cover banner) */}
      <div className="rounded-2xl shadow-sm border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1e293b] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
            {/* Avatar with Camera Trigger */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-slate-200 dark:border-white/10 overflow-hidden bg-slate-100 dark:bg-[#0f172a] shadow-md relative">
                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20 text-white">
                    <RefreshCcw className="animate-spin w-6 h-6 text-[#df6742] mb-1" />
                    <span className="text-[10px] font-bold">Uploading...</span>
                  </div>
                )}
                {image ? (
                  <img
                    src={image}
                    alt={name || "Profile"}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-black text-slate-400 dark:text-slate-600 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                    {(name || user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Upload Action Button */}
              <label
                className="absolute -bottom-1 -right-1 bg-[#df6742] hover:bg-[#c55332] text-white p-2 rounded-xl cursor-pointer shadow-md hover:scale-105 transition-all border-2 border-white dark:border-[#1e293b] flex items-center justify-center group/btn"
                title="Change Profile Photo"
              >
                <Camera size={15} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            </div>

            {/* Name & Role Details */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {name || user?.name || "ArtHub User"}
                </h1>
                <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${roleConfig.badgeClass}`}>
                  <RoleIcon size={12} />
                  {roleConfig.title}
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
                {user?.email}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs hidden sm:block">
                {roleConfig.subtitle}
              </p>
            </div>
          </div>

          {/* Member Badge on Right */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-semibold">
            <Sparkles size={15} className="text-[#df6742]" />
            ArtHub Verified Member
          </div>
        </div>
      </div>

      {/* Main Form & Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Security & Role Information Card */}
        <div className="space-y-6">
          {/* Account Verification Status */}
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" />
              Account Security
            </h3>

            <div className="flex items-center gap-3 p-3.5 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">Active & Verified</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Authenticated with secure session token</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Account Type</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Cloud Storage</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">ImgBB Integrated</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Sync Status</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Realtime MongoDB</span>
              </div>
            </div>
          </div>

          {/* Role Privileges Card */}
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-2">
              <RoleIcon size={16} className="text-[#df6742]" />
              Role Highlights
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {role === "admin" &&
                "You have administrative clearance to manage all users, review & verify artwork submissions, control stock, inspect transactions, and maintain platform metrics."}
              {role === "artist" &&
                "You have artist privileges to exhibit original artworks, adjust inventory stock quantities, view sales performance, and connect with global collectors."}
              {role === "user" &&
                "You have collector privileges to explore fine artwork catalogs, make verified Stripe checkout purchases, save favorites to your wishlist, and track order deliveries."}
            </p>
          </div>
        </div>

        {/* Right Column: Editable Profile Information Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 shadow-sm">
            <div className="border-b border-slate-100 dark:border-white/5 pb-6 mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile Information</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Update your personal details, professional bio, and contact information across ArtHub.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 ml-1">
                    Full Name <span className="text-[#df6742]">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-800 dark:text-white text-sm focus:border-[#df6742] focus:ring-2 focus:ring-[#df6742]/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email (Read-Only) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Email Address
                    </label>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Primary
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input
                      type="email"
                      disabled
                      value={user?.email || ""}
                      className="w-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/5 rounded-xl py-3 pl-11 pr-4 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 ml-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-800 dark:text-white text-sm focus:border-[#df6742] focus:ring-2 focus:ring-[#df6742]/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Specialty / Medium / Role Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 ml-1">
                    {role === "artist" ? "Artistic Specialty / Medium" : "Collector Specialty / Title"}
                  </label>
                  <div className="relative">
                    <Palette className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input
                      type="text"
                      list="specialties-list"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder={role === "artist" ? "e.g. Oil Painting, Digital Art" : "e.g. Fine Art Enthusiast"}
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-800 dark:text-white text-sm focus:border-[#df6742] focus:ring-2 focus:ring-[#df6742]/20 focus:outline-none transition-all"
                    />
                    <datalist id="specialties-list">
                      {ART_SPECIALTIES.map((spec) => (
                        <option key={spec} value={spec} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              {/* Bio / Artist Statement */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {role === "artist" ? "Artist Statement & Bio" : "Personal Bio"}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {bio.length}/500 chars
                  </span>
                </div>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-slate-400 dark:text-slate-500" size={18} />
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={
                      role === "artist"
                        ? "Tell collectors about your artistic vision, influences, creative background, and exhibition philosophy..."
                        : "Write a short bio about your passions, collection interests, and love for art..."
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-800 dark:text-white text-sm focus:border-[#df6742] focus:ring-2 focus:ring-[#df6742]/20 focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isUpdating || isUploading}
                  className="w-full sm:w-auto bg-[#df6742] hover:bg-[#c55332] text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-[#df6742]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
                >
                  {isUpdating ? (
                    <RefreshCcw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  <span>{isUpdating ? "Saving Changes..." : "Save Profile Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
