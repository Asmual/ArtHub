/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { 
  User, 
  Mail, 
  Camera, 
  Save, 
  ShieldCheck, 
  Loader2, 
  RefreshCcw 
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Sync state with session data
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setImage(user.image || "");
    }
  }, [user]);

  // Handle Image Upload to ImgBB
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      // Upload image to ImgBB storage API
      const apiUrl = process.env.NEXT_PUBLIC_IMGBB_API_URL || "https://api.imgbb.com/1/upload";
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

      if (!apiKey) {
        toast.error("ImgBB API Key missing in .env file");
        setIsUploading(false);
        return;
      }

      const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setImage(data.data.url);
        toast.success("Image uploaded to cloud!");
      } else {
        toast.error(data.error?.message || "Image upload failed");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Profile Update via authClient
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name cannot be empty");

    setIsUpdating(true);
    try {
      // Using BetterAuth / authClient to update user profile
      await authClient.updateUser({
        name: name,
        image: image,
      }, {
        onSuccess: () => {
          toast.success("Profile updated successfully!");
          setIsUpdating(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to update profile");
          setIsUpdating(false);
        }
      });
    } catch (error) {
      toast.error("Something went wrong");
      setIsUpdating(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 text-[#df6742] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-[#243239] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Profile Management</h1>
          <p className="text-slate-500 dark:text-white/40 text-sm mt-1">Update your personal information and profile picture.</p>
        </div>
        <div className="hidden sm:block">
          <div className="px-3 py-1 bg-orange-50 dark:bg-[#df6742]/10 border border-[#df6742]/20 rounded-full">
            <span className="text-[#df6742] text-xs font-bold uppercase tracking-widest">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Avatar Upload Section */}
        <div className="lg:col-span-1 bg-white dark:bg-[#243239] p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none flex flex-col items-center justify-center text-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-[#df6742] overflow-hidden bg-slate-100 dark:bg-black/20 relative">
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                  <RefreshCcw className="text-white animate-spin w-6 h-6" />
                </div>
              ) : null}
              {image ? (
                <img 
                  src={image} 
                  alt="Profile" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-300 dark:text-white/20">
                  {user?.name?.charAt(0)}
                </div>
              )}
            </div>
            
            {/* Upload Trigger */}
            <label className="absolute bottom-1 right-1 bg-[#df6742] p-2 rounded-full cursor-pointer hover:bg-[#c55332] transition-colors shadow-lg border-2 border-white dark:border-[#243239]">
              <Camera size={18} className="text-white" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          </div>
          
          <h2 className="mt-4 text-lg font-bold text-slate-800 dark:text-white truncate max-w-full">{user?.name}</h2>
          <p className="text-slate-500 dark:text-white/40 text-xs truncate max-w-full">{user?.email}</p>
        </div>

        {/* Right: Info Form Section */}
        <div className="lg:col-span-2 bg-white dark:bg-[#243239] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/20" size={18} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-800 dark:text-white focus:border-[#df6742]/50 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Field (Disabled) */}
            <div className="space-y-2 opacity-60">
              <label className="text-xs font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider ml-1">Email Address (Primary)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/20" size={18} />
                <input 
                  type="email" 
                  value={user?.email || ""} 
                  disabled
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl py-3 pl-11 pr-4 text-slate-500 dark:text-white/50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Verification Status */}
            <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10 rounded-xl">
              <ShieldCheck className="text-emerald-600 dark:text-emerald-500" size={16} />
              <p className="text-[11px] text-emerald-700 dark:text-emerald-500/80 font-medium">Your account is verified and secure.</p>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={isUpdating || isUploading}
              className="w-full bg-[#df6742] hover:bg-[#c55332] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {isUpdating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save size={19} />
              )}
              {isUpdating ? "Saving Changes..." : "Update Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}