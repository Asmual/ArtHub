"use client";

import React, { useState, useRef, useEffect } from "react";
import NextLink from "next/link";
import { FaCloudUploadAlt, FaPaintBrush, FaDollarSign, FaTags, FaSpinner, FaTrashAlt, FaCrown } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import Image from "next/image";
import { getAuthToken } from "@/lib/auth-utils";


// Upload image to imgBB
const uploadToImgBB = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Image upload to imgBB failed");
  }

  const data = await response.json();
 
  if (!data.success) {
    throw new Error(data.error?.message || "imgBB upload failed");
  }

  return data.data.url;
};

export default function AddArtPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef(null);
  const [subInfo, setSubInfo] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "Painting",
    price: "",
    description: "",
  });

  const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");

  useEffect(() => {
    if (!user?.email) return;
    fetch(`/api/subscription?email=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSubInfo(data);
        }
      })
      .catch((err) => console.error("Failed to check subscription:", err));
  }, [user?.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  /**
   * Handle image file selection and upload to imgBB
   */
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    setUploadingImage(true);
    setImagePreview(URL.createObjectURL(file));

    try {
      const url = await uploadToImgBB(file);
      setImageUrl(url);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error(err?.message || "Failed to upload image. Please try again.");
      setImagePreview(null);
      setImageUrl("");
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setUploadingImage(false);
    }
  };

  /**
   * Handle removing the selected image
   */
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Verifies if a structured string maps to an immutable CDN location matching direct image criteria
   */
  const isValidDirectImageUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    const URL_REGEX = /^https:\/\/[a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}\/.*\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i;
    return URL_REGEX.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to upload artwork.");
      return;
    }

    if (subInfo && !subInfo.canUploadMore) {
      toast.error(`Artwork limit reached (${subInfo.artworkLimit} artworks on ${subInfo.plan.toUpperCase()} plan). Please upgrade your plan.`);
      return;
    }

    if (!isValidDirectImageUrl(imageUrl)) {
      toast.error("Please upload a valid image. The image URL must be from a secure CDN.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title,
        price: Number(formData.price),
        image: imageUrl,
        artistName: user.name || "Unknown Artist",
        artistEmail: user.email,
        artistImage: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'Artist'}`,
        category: formData.category,
        isSold: false,
        createdAt: new Date().toISOString().split('T')[0],
        description: formData.description,
      };

      let saved = false;

      // 1. Try local Next.js internal API first
      try {
        const localRes = await fetch("/api/artworks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (localRes.ok) {
          saved = true;
        } else {
          const errData = await localRes.json().catch(() => ({}));
          if (localRes.status === 403 || errData?.code === "PLAN_LIMIT_REACHED") {
            throw new Error(errData.message || "Artwork limit reached for your current plan. Please upgrade to continue.");
          }
        }
      } catch (localErr) {
        if (localErr.message && (localErr.message.includes("limit") || localErr.message.includes("plan") || localErr.message.includes("quota"))) {
          throw localErr;
        }
        console.warn("Local artwork creation skipped, trying external gateway:", localErr);
      }

      // 2. Fallback to external backend if needed
      if (!saved) {
        const token = await getAuthToken(user.email);
        const res = await fetch(`${base}/api/artworks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const responseData = await res.json().catch(() => ({}));
          throw new Error(responseData?.message || responseData?.error || "Failed to save artwork.");
        }
      }

      toast.success("Artwork published successfully.");
      // Refresh quota stats
      if (user?.email) {
        fetch(`/api/subscription?email=${encodeURIComponent(user.email)}`)
          .then((r) => r.json())
          .then((d) => d.success && setSubInfo(d))
          .catch(() => {});
      }
      // Reset form
      setFormData({ title: "", category: "Painting", price: "", description: "" });
      setImagePreview(null);
      setImageUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Publish artwork error:", err);
      toast.error(err?.message || "Failed to publish artwork.");
    } finally {
      setLoading(false);
    }

  };

  const isFormValid = imageUrl && formData.title && formData.price && formData.description;
  const isSubmitting = loading || uploadingImage;

  return (
    <div className="min-h-screen bg-background p-6 sm:p-10 text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="max-w-4xl mx-auto bg-surface border border-border-line rounded-2xl p-6 sm:p-8 shadow-xl">
       
        {/* Header Block */}
        <div className="mb-6 border-b border-border-line pb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FaPaintBrush className="text-[#df6742]" /> Upload<span className="text-[#df6742]">New Artwork</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">Fill in the details below to exhibit and showcase your dynamic artwork portfolio.</p>
        </div>

        {/* Subscription Plan Quota Notice */}
        {subInfo && (
          <div className={`mb-6 p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
            !subInfo.canUploadMore
              ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
              : "bg-[var(--hover-bg)] border-border-line text-foreground"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                !subInfo.canUploadMore ? "bg-amber-500/20 text-amber-500" : "bg-[var(--brand)]/10 text-[var(--brand)]"
              }`}>
                <FaCrown size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2 flex-wrap">
                  <span>Current Plan: <strong className="uppercase text-[var(--brand)]">{subInfo.plan}</strong></span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-border-line text-foreground/80 font-semibold">
                    {subInfo.artworkCount} / {subInfo.artworkLimit} Artworks
                  </span>
                </h4>
                <p className="text-xs text-foreground/60 mt-0.5">
                  {!subInfo.canUploadMore
                    ? `You have reached the maximum allowed artworks on the ${subInfo.plan.toUpperCase()} plan (5 free artworks limit). Please upgrade to add more.`
                    : `You have ${subInfo.remainingSlots} artwork slot${subInfo.remainingSlots === 1 ? '' : 's'} remaining before requiring an upgrade.`}
                </p>
              </div>
            </div>
            {!subInfo.canUploadMore && (
              <NextLink
                href="/#pricing"
                className="px-4 py-2 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white text-xs font-bold transition-all shadow-md shrink-0 whitespace-nowrap"
              >
                Upgrade to Premium
              </NextLink>
            )}
          </div>
        )}


        {/* Input Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
         
          {/* Top Row: Title, Category, Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           
            {/* Title Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Artwork Title</label>
              <input
                type="text" name="title" required value={formData.title} onChange={handleChange}
                placeholder="e.g., The Golden Harvest"
                className="bg-background border border-border-line text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#df6742] transition-all duration-200"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Category</label>
              <div className="relative">
                <select
                  name="category" value={formData.category} onChange={handleChange}
                  className="w-full bg-background border border-border-line text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#df6742] appearance-none cursor-pointer"
                >
                  <option value="Painting">Painting</option>
                  <option value="Digital Art">Digital Art</option>
                  <option value="Sculpture">Sculpture</option>
                  <option value="Sketch">Sketch</option>
                  <option value="Photography">Photography</option>
                </select>
                <FaTags className="absolute right-4 top-4 text-xs text-text-subtle pointer-events-none" />
              </div>
            </div>

            {/* Price Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Price (USD)</label>
              <div className="relative">
                <input
                  type="number" name="price" required min="1" value={formData.price} onChange={handleChange}
                  placeholder="180"
                  className="w-full bg-background border border-border-line text-foreground rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#df6742] transition-all duration-200"
                />
                <FaDollarSign className="absolute left-3.5 top-4 text-xs text-text-subtle" />
              </div>
            </div>
          </div>

          {/* Middle Row: Image Upload (Sized like input) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Artwork Image</label>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
                disabled={uploadingImage}
              />
              <label
                htmlFor="image-upload"
                className={`
                  w-full flex items-center
                  bg-background border-2 border-dashed border-border-line
                  rounded-xl px-4 h-11.5 text-sm
                  transition-all duration-200
                  cursor-pointer hover:border-[#df6742]
                  ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}
                  ${imagePreview ? 'border-[#df6742] bg-[#df6742]/5' : ''}
                `}
              >
                {uploadingImage ? (
                  <div className="flex items-center gap-3">
                    <FaSpinner className="text-lg text-[#df6742] animate-spin" />
                    <span className="text-text-muted text-xs">Uploading...</span>
                  </div>
                ) : imagePreview ? (
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded overflow-hidden border border-border-line">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-xs text-[#df6742] font-medium truncate max-w-50">✓ Image ready</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveImage();
                      }}
                      className="text-error hover:text-error/80 transition-colors"
                      title="Remove image"
                    >
                      <FaTrashAlt size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <FaCloudUploadAlt className="text-xl text-text-subtle" />
                    <span className="text-text-muted text-xs">Click to choose image (PNG, JPG, up to 10MB)</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Bottom Field: Description */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Artwork Description</label>
            <textarea
              name="description" required rows="5" value={formData.description} onChange={handleChange}
              placeholder="Tell collectors about the inspiration, dynamic colors, or story behind this piece..."
              className="bg-background border border-border-line text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#df6742] transition-all duration-200 resize-none"
            />
          </div>

          {/* Action Trigger Button */}
          <div className="pt-4 border-t border-border-line mt-8">
            <button
              type="submit"
              className={`
                w-full py-4 text-xs font-bold tracking-wider
                bg-[#df6742] text-white hover:bg-[#ca5633]
                rounded-xl shadow-lg shadow-[#df6742]/10
                transition-all duration-200 uppercase
                flex items-center justify-center gap-2
              `}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Publishing Portfolio...
                </>
              ) : (
                "Publish Artwork"
              )}
            </button>
            {!isFormValid && !isSubmitting && (
              <p className="text-xs text-text-muted mt-3 text-center">
                Please fill in all fields (Title, Price, Description) and upload an image to publish.
              </p>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}