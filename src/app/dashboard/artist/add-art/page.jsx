"use client";

import React, { useState, useRef, useEffect } from "react";
import NextLink from "next/link";
import { FaCloudUploadAlt, FaPaintBrush, FaDollarSign, FaTags, FaSpinner, FaTrashAlt, FaCrown, FaMagic } from "react-icons/fa";
import { Sparkles, Wand2 } from "lucide-react";
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
    quantity: "1",
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

  const [analyzingWithAi, setAnalyzingWithAi] = useState(false);
  const [aiGeneratedData, setAiGeneratedData] = useState(null);

  /**
   * Handle AI Vision analysis to auto-fill artwork metadata
   */
  const handleAutoFillWithAi = async () => {
    if (!imageUrl) {
      toast.error("Please wait for your artwork image to finish uploading before analyzing with AI.");
      return;
    }

    try {
      setAnalyzingWithAi(true);
      toast("Gemini AI is analyzing your artwork's palette, mood, and style...");

      let aiResult = null;

      // 1. Try local Next.js AI route first
      try {
        const res = await fetch("/api/ai/describe-artwork", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.success) {
            aiResult = resData.data;
          }
        }
      } catch (localErr) {
        console.warn("Local AI route skipped, trying external gateway:", localErr);
      }

      // 2. Fallback to external Express backend if needed
      if (!aiResult) {
        const serverBase = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
        const res = await fetch(`${serverBase}/api/ai/describe-artwork`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.success) {
            aiResult = resData.data;
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to analyze artwork with AI.");
        }
      }

      if (aiResult) {
        const validCategories = ["Painting", "Digital Art", "Sculpture", "Sketch", "Photography"];
        const matchedCategory = validCategories.includes(aiResult.category)
          ? aiResult.category
          : "Painting";

        setFormData((prev) => ({
          ...prev,
          title: aiResult.title || prev.title,
          description: aiResult.description || prev.description,
          category: matchedCategory,
          price: aiResult.suggestedPrice ? String(aiResult.suggestedPrice) : prev.price,
        }));

        setAiGeneratedData(aiResult);
        toast.success("Artwork details auto-filled with Gemini 3.6 AI!");
      }
    } catch (err) {
      console.error("AI Auto-fill error:", err);
      toast.error(err.message || "Could not analyze artwork with AI.");
    } finally {
      setAnalyzingWithAi(false);
    }
  };

  /**
   * Handle removing the selected image
   */
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageUrl("");
    setAiGeneratedData(null);
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

      const qty = Math.max(1, Number(formData.quantity || 1));
      const payload = {
        title: formData.title,
        price: Number(formData.price),
        quantity: qty,
        image: imageUrl,
        artistName: user.name || "Unknown Artist",
        artistEmail: user.email,
        userId: user.id || null,
        artistId: user.id || null,
        artistImage: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'Artist'}`,
        category: formData.category,
        isSold: false,
        status: "available",
        createdAt: new Date().toISOString().split('T')[0],
        description: formData.description,
        tags: aiGeneratedData?.tags || [],
        dominantColors: aiGeneratedData?.dominantColors || [],
        aiEnhanced: !!aiGeneratedData,
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
      <div className="w-full lg:w-[92%] 2xl:w-[85%] mx-auto bg-surface border border-border-line rounded-2xl p-6 sm:p-8 shadow-xl">
       
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
         
          {/* Top Row: Title, Category, Price, Stock Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           
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

            {/* Stock Quantity Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Stock Quantity</label>
              <input
                type="number" name="quantity" required min="1" value={formData.quantity} onChange={handleChange}
                placeholder="1"
                className="w-full bg-background border border-border-line text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#df6742] transition-all duration-200 font-semibold"
              />
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

            {/* AI Studio Assistant Auto-Fill Action Banner */}
            {imageUrl && (
              <div className="mt-2 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[#df6742]/10 via-amber-500/10 to-transparent border border-[#df6742]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#df6742]/20 border border-[#df6742]/30 flex items-center justify-center text-[#df6742] shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <span>AI Studio Assistant</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#df6742] text-white font-semibold">Gemini 3.6 Vision</span>
                    </h4>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Let Gemini AI analyze your canvas colors, brushwork, and theme to auto-generate title, story, and tags.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAutoFillWithAi}
                  disabled={analyzingWithAi || uploadingImage}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#df6742] to-amber-600 hover:from-[#c55332] hover:to-amber-700 disabled:opacity-60 text-white text-xs font-bold transition-all shadow-md shadow-[#df6742]/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  {analyzingWithAi ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      <span>Analyzing Canvas...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={14} />
                      <span>✨ Auto-Fill with AI</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* AI Generated Visual Insights Panel */}
            {aiGeneratedData && (
              <div className="mt-2 p-4 rounded-xl bg-[var(--hover-bg)] border border-border-line space-y-3 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-line pb-2.5">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles size={13} className="text-[#df6742]" />
                    <span>Gemini AI Visual Insights</span>
                  </span>
                  {aiGeneratedData.suggestedPrice && (
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      Suggested Value: ${aiGeneratedData.suggestedPrice}
                    </span>
                  )}
                </div>

                {/* Dominant Palette Swatches */}
                {aiGeneratedData.dominantColors && aiGeneratedData.dominantColors.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[11px] font-semibold text-text-muted">Detected Palette:</span>
                    <div className="flex items-center gap-1.5">
                      {aiGeneratedData.dominantColors.map((hex, idx) => (
                        <div
                          key={idx}
                          className="w-5 h-5 rounded-full border border-white/20 shadow-xs cursor-help"
                          style={{ backgroundColor: hex }}
                          title={`Color: ${hex}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Detected Tags */}
                {aiGeneratedData.tags && aiGeneratedData.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] font-semibold text-text-muted mr-1">Generated Tags:</span>
                    {aiGeneratedData.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#df6742]/10 border border-[#df6742]/20 text-[#df6742] text-[10px] font-semibold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
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