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

  // Handle Profile Update via authClient and backend API
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name cannot be empty");

    setIsUpdating(true);
    try {
      // Update BetterAuth user session
      await authClient.updateUser({
        name: name,
        image: image,
      });

      // Synchronize changes to MongoDB database
      const base = (
        process.env.NEXT_PUBLIC_API_URL ||
        "https://arthub-server-z4w8.onrender.com"
      ).replace(/\/$/, "");

      const resToken = await fetch(`${base}/api/users/generate-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      if (resToken.ok) {
        const { token } = await resToken.json();
        await fetch(`${base}/api/users/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, image }),
        });
      }

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("[PROFILE ERROR] Admin profile update error:", error);
      toast.error("Something went wrong");
    } finally {
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
      <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border-line)] flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)]">Profile Management</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Update your personal information and profile picture.</p>
        </div>
        <div className="hidden sm:block">
          <div className="px-3 py-1 bg-[#df6742]/10 border border-[#df6742]/20 rounded-full">
            <span className="text-[#df6742] text-xs font-bold uppercase tracking-widest">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Avatar Upload Section */}
        <div className="lg:col-span-1 bg-[var(--surface)] p-8 rounded-2xl border border-[var(--border-line)] flex flex-col items-center justify-center text-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-[#df6742] overflow-hidden bg-[var(--hover-bg)] relative">
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
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[var(--text-subtle)]">
                  {user?.name?.charAt(0)}
                </div>
              )}
            </div>
            
            {/* Upload Trigger */}
            <label className="absolute bottom-1 right-1 bg-[#df6742] p-2 rounded-full cursor-pointer hover:bg-[#c55332] transition-colors shadow-lg border-2 border-[var(--surface)]">
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
          
          <h2 className="mt-4 text-lg font-bold text-[var(--text-main)] truncate max-w-full">{user?.name}</h2>
          <p className="text-[var(--text-muted)] text-xs truncate max-w-full">{user?.email}</p>
        </div>

        {/* Right: Info Form Section */}
        <div className="lg:col-span-2 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border-line)]">
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" size={18} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-[var(--hover-bg)] border border-[var(--border-line)] rounded-xl py-3 pl-11 pr-4 text-[var(--text-main)] focus:border-[#df6742]/50 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Field (Disabled) */}
            <div className="space-y-2 opacity-60">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1">Email Address (Primary)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" size={18} />
                <input 
                  type="email" 
                  value={user?.email || ""} 
                  disabled
                  className="w-full bg-[var(--hover-bg)] border border-[var(--border-line)] rounded-xl py-3 pl-11 pr-4 text-[var(--text-muted)] cursor-not-allowed"
                />
              </div>
            </div>

            {/* Verification Status */}
            <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
              <ShieldCheck className="text-emerald-500" size={16} />
              <p className="text-[11px] text-emerald-500/80 font-medium">Your account is verified and secure.</p>
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