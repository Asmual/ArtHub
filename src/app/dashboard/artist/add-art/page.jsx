"use client";

import React, { useState } from "react";
import { FaCloudUploadAlt, FaPaintBrush, FaDollarSign, FaTags } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

export default function AddArtPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Painting",
    price: "",
    description: "",
    image: "",
  });

  const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    if (!isValidDirectImageUrl(formData.image)) {
      toast.error("Please supply a valid, secure direct image URL link (e.g., https://i.ibb.co/...). Check your image source formatting.");
      return;
    }

    try {
      setLoading(true);

      const sessionToken = authClient.getAccessToken?.() || localStorage.getItem("better-auth.session-token");

      const payload = {
        title: formData.title,
        price: Number(formData.price),
        image: formData.image,
        artistName: user.name || "Unknown Artist",
        artistEmail: user.email,
        artistImage: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'Artist'}`,
        category: formData.category,
        isSold: false,
        createdAt: new Date().toISOString().split('T')[0],
        description: formData.description,
      };

      const res = await fetch(`${base}/api/artworks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned HTML/Error page instead of JSON. Check backend authentication middleware configuration.");
      }

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData?.message || responseData?.error || "Failed to save artwork.");
      }

      toast.success("Artwork published and saved to MongoDB!");
      setFormData({ title: "", category: "Painting", price: "", description: "", image: "" });
    } catch (err) {
      console.error("Publish artwork error:", err);
      toast.error(err?.message || "Failed to upload artwork to cloud database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2f3f48] p-6 sm:p-10 text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="max-w-3xl mx-auto bg-[#243239] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl">
       
        {/* Header Block */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaPaintBrush className="text-[#df6742]" /> Upload New Masterpiece
          </h1>
          <p className="text-xs text-white/40 mt-1">Fill in the details below to exhibit and showcase your dynamic artwork portfolio.</p>
        </div>

        {/* Input Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           
            {/* Title Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/60">Artwork Title</label>
              <input
                type="text" name="title" required value={formData.title} onChange={handleChange}
                placeholder="e.g., The Golden Harvest"
                className="bg-[#2f3f48] border border-white/8 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#df6742]/60 transition-all duration-200"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/60">Category</label>
              <div className="relative">
                <select
                  name="category" value={formData.category} onChange={handleChange}
                  className="w-full bg-[#2f3f48] border border-white/8 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#df6742]/60 appearance-none cursor-pointer"
                >
                  <option value="Painting">Painting</option>
                  <option value="Digital Art">Digital Art</option>
                  <option value="Sculpture">Sculpture</option>
                  <option value="Sketch">Sketch</option>
                  <option value="Photography">Photography</option>
                </select>
                <FaTags className="absolute right-4 top-4 text-xs text-white/30 pointer-events-none" />
              </div>
            </div>

            {/* Price Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/60">Price (USD)</label>
              <div className="relative">
                <input
                  type="number" name="price" required min="1" value={formData.price} onChange={handleChange}
                  placeholder="180"
                  className="w-full bg-[#2f3f48] border border-white/8 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#df6742]/60 transition-all duration-200"
                />
                <FaDollarSign className="absolute left-3.5 top-4 text-xs text-white/40" />
              </div>
            </div>

            {/* Image URL Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/60">Image Hosted Link URL</label>
              <div className="relative">
                <input
                  type="url" name="image" required value={formData.image} onChange={handleChange}
                  placeholder="https://i.ibb.co.com/..."
                  className="w-full bg-[#2f3f48] border border-white/8 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#df6742]/60 transition-all duration-200"
                />
                <FaCloudUploadAlt className="absolute left-3.5 top-3.5 text-base text-white/40" />
              </div>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/60">Artwork Description</label>
            <textarea
              name="description" required rows="4" value={formData.description} onChange={handleChange}
              placeholder="Tell collectors about the inspiration, dynamic colors, or story behind this piece..."
              className="bg-[#2f3f48] border border-white/8 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#df6742]/60 transition-all duration-200 resize-none"
            />
          </div>

          {/* Action Trigger Button */}
          <div className="pt-2">
            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 text-xs font-bold tracking-wider bg-[#df6742] text-white hover:bg-[#ca5633] disabled:bg-neutral-700 disabled:text-neutral-500 rounded-xl shadow-lg shadow-[#df6742]/10 transition-all duration-200 uppercase"
            >
              {loading ? "Publishing Portfolio..." : "Publish Artwork"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}