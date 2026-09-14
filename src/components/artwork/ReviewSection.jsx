/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, MoreVertical, Pencil, Trash2, CheckCircle2, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getAuthToken } from "@/lib/auth-utils";

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "Just now";
  const date = new Date(timestamp);
  const now = new Date();
  const secondsPast = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secondsPast < 0) return "Just now";
  if (secondsPast < 60) return `${secondsPast}s ago`;
  const minutesPast = Math.floor(secondsPast / 60);
  if (minutesPast < 60) return `${minutesPast}m ago`;
  const hoursPast = Math.floor(minutesPast / 60);
  if (hoursPast < 24) return `${hoursPast}h ago`;
  const daysPast = Math.floor(hoursPast / 24);
  if (daysPast < 7) return `${daysPast}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

const ratingLabels = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Masterpiece!",
};

// Interactive star selector component
const StarRatingInput = ({ value, onChange, size = "md", disabled = false }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const starSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverValue || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => !disabled && setHoverValue(star)}
            onMouseLeave={() => !disabled && setHoverValue(0)}
            className={`p-0.5 rounded transition-transform ${
              disabled ? "cursor-default" : "hover:scale-110 cursor-pointer focus:outline-none"
            }`}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`${starSizes[size] || starSizes.md} ${
                isFilled
                  ? "fill-[#f59e0b] text-[#f59e0b] drop-shadow-sm"
                  : "text-slate-300 dark:text-neutral-600"
              } transition-colors`}
            />
          </button>
        );
      })}
      {value > 0 && !disabled && (
        <span className="text-xs font-semibold text-[#f59e0b] ml-1.5 transition-all">
          {ratingLabels[hoverValue || value]}
        </span>
      )}
    </div>
  );
};

// Static star display component
const StarRatingDisplay = ({ rating = 5, size = "sm" }) => {
  const starSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
  };

  const clamped = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));

  return (
    <div className="flex items-center gap-0.5" title={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSizes[size] || starSizes.sm} ${
            star <= clamped
              ? "fill-[#f59e0b] text-[#f59e0b]"
              : "text-slate-300 dark:text-neutral-600"
          }`}
        />
      ))}
    </div>
  );
};

const ReviewSection = ({
  artworkId,
  currentUser,
  hasPaid,
  isAdmin,
  isArtist,
  isArtworkOwner,
  artworkOwnerEmail,
}) => {
  const [reviews, setReviews] = useState([]);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit review state
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [savingEdit, setSavingEdit] = useState(false);

  // 3-dot dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetedDeleteId, setTargetedDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [, setTimeTicker] = useState(Date.now());

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com";
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch reviews with resilient fallback
  const fetchReviews = useCallback(async () => {
    if (!artworkId) return;
    try {
      let data = null;

      // 1. Try local Next.js internal API first
      try {
        const localRes = await fetch(`/api/reviews?artworkId=${artworkId}`, { cache: "no-store" });
        if (localRes.ok) {
          data = await localRes.json();
        }
      } catch (e) {
        console.warn("[REVIEWS] Local route fallback:", e.message);
      }

      // 2. Try external Express backend if needed
      if (!Array.isArray(data)) {
        const extRes = await fetch(`${cleanBaseUrl}/api/reviews/${artworkId}`);
        if (extRes.ok) {
          data = await extRes.json();
        }
      }

      if (Array.isArray(data)) {
        setReviews(data);
      }
      setLoading(false);
    } catch (error) {
      console.error("[REVIEWS] Error loading reviews stream:", error);
      setLoading(false);
    }
  }, [artworkId, cleanBaseUrl]);

  useEffect(() => {
    fetchReviews();
    const tickerInterval = setInterval(() => {
      setTimeTicker(() => Date.now());
    }, 30000);
    return () => clearInterval(tickerInterval);
  }, [fetchReviews]);

  // Authorization check for editing/deleting a review
  const canModifyReview = (rev) => {
    if (!currentUser) return false;
    // 1. Admin
    if (isAdmin || currentUser.role === "admin") return true;
    // 2. Author of the review
    const userEmail = currentUser.email?.toLowerCase().trim();
    if (userEmail && rev.userEmail && rev.userEmail.toLowerCase().trim() === userEmail) {
      return true;
    }
    // 3. Artist / Owner of the artwork
    if (isArtworkOwner) return true;
    if (artworkOwnerEmail && userEmail && artworkOwnerEmail.toLowerCase().trim() === userEmail) {
      return true;
    }
    return false;
  };

  // Submit new review
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please sign in to share your review.");
      return;
    }
    if (!text.trim()) {
      toast.error("Please provide review comments.");
      return;
    }

    setSubmitting(true);
    try {
      const token = await getAuthToken(cleanBaseUrl, currentUser.email);
      const payload = {
        artworkId,
        text: text.trim(),
        rating: Math.max(1, Math.min(5, Number(rating) || 5)),
        userName: currentUser.name || "Art Collector",
        userImage: currentUser.image || "",
        userEmail: currentUser.email,
      };

      let success = false;

      // 1. Try local Next.js API
      try {
        const localRes = await fetch("/api/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (localRes.ok) success = true;
      } catch (err) {
        console.warn("[REVIEWS] Local post fallback:", err.message);
      }

      // 2. Fallback to Express backend if needed
      if (!success) {
        const extRes = await fetch(`${cleanBaseUrl}/api/reviews`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (extRes.ok) success = true;
        else {
          const errData = await extRes.json().catch(() => ({}));
          toast.error(errData.message || "Failed to post review.");
          setSubmitting(false);
          return;
        }
      }

      if (success) {
        setText("");
        setRating(5);
        toast.success("Review posted successfully!");
        fetchReviews();
      }
    } catch (error) {
      console.error("[REVIEW ERROR] Post review error:", error);
      toast.error("Error submitting review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Start editing a review
  const startEdit = (rev) => {
    setEditingId(rev._id);
    setEditText(rev.text);
    setEditRating(typeof rev.rating === "number" ? rev.rating : 5);
    setOpenDropdownId(null);
  };

  // Save edited review
  const handleUpdate = async (reviewId) => {
    if (!editText.trim() || !currentUser) return;
    setSavingEdit(true);

    try {
      const token = await getAuthToken(cleanBaseUrl, currentUser.email);
      const payload = {
        text: editText.trim(),
        rating: Math.max(1, Math.min(5, Number(editRating) || 5)),
        userEmail: currentUser.email,
      };

      let success = false;

      // 1. Try local Next.js API
      try {
        const localRes = await fetch(`/api/reviews/${reviewId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (localRes.ok) success = true;
      } catch (err) {
        console.warn("[REVIEWS] Local update fallback:", err.message);
      }

      // 2. Fallback to Express backend
      if (!success) {
        const extRes = await fetch(`${cleanBaseUrl}/api/reviews/${reviewId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (extRes.ok) success = true;
        else {
          const errData = await extRes.json().catch(() => ({}));
          toast.error(errData.message || "Failed to update review.");
          setSavingEdit(false);
          return;
        }
      }

      if (success) {
        setEditingId(null);
        setEditText("");
        toast.success("Review updated successfully!");
        fetchReviews();
      }
    } catch (error) {
      console.error("[REVIEW ERROR] Update review error:", error);
      toast.error("Error updating review.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Trigger delete modal
  const openDeleteConfirmation = (reviewId) => {
    setTargetedDeleteId(reviewId);
    setShowDeleteModal(true);
    setOpenDropdownId(null);
  };

  // Execute review deletion
  const executeDelete = async () => {
    if (!targetedDeleteId || !currentUser) return;
    setDeleting(true);

    try {
      const token = await getAuthToken(cleanBaseUrl, currentUser.email);
      let success = false;

      // 1. Try local Next.js API
      try {
        const localRes = await fetch(`/api/reviews/${targetedDeleteId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (localRes.ok) success = true;
      } catch (err) {
        console.warn("[REVIEWS] Local delete fallback:", err.message);
      }

      // 2. Fallback to Express backend
      if (!success) {
        const extRes = await fetch(`${cleanBaseUrl}/api/reviews/${targetedDeleteId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (extRes.ok) success = true;
        else {
          const errData = await extRes.json().catch(() => ({}));
          toast.error(errData.message || "Failed to delete review.");
          setDeleting(false);
          return;
        }
      }

      if (success) {
        setShowDeleteModal(false);
        setTargetedDeleteId(null);
        toast.success("Review deleted successfully!");
        fetchReviews();
      }
    } catch (error) {
      console.error("[REVIEW ERROR] Delete review error:", error);
      toast.error("Error deleting review.");
    } finally {
      setDeleting(false);
    }
  };

  // Compute rating statistics
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviewCount).toFixed(1)
      : null;

  return (
    <div className="space-y-8 relative">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#24333b] p-6 rounded-2xl max-w-md w-full space-y-4 border border-slate-200 dark:border-neutral-700/60 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2.5 rounded-full bg-red-100 dark:bg-red-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100">
                Delete Review
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-neutral-300">
              Are you sure you want to permanently delete this review? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setTargetedDeleteId(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-neutral-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={executeDelete}
                className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Rating Breakdown Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-neutral-700/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-[#df6742]" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Customer Reviews & Ratings
            </h2>
            <span className="text-xs font-bold bg-[#df6742]/10 dark:bg-[#df6742]/20 text-[#df6742] px-2.5 py-0.5 rounded-full">
              {reviewCount}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            Real feedback and verified ratings from art collectors and visitors.
          </p>
        </div>

        {avgRating && (
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-neutral-700/50 px-4 py-2.5 rounded-2xl shrink-0">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-slate-800 dark:text-neutral-100 leading-none">
                {avgRating}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">out of 5</span>
            </div>
            <div className="space-y-1 border-l border-slate-200 dark:border-neutral-700 pl-3">
              <StarRatingDisplay rating={Number(avgRating)} size="sm" />
              <p className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
                Based on {reviewCount} {reviewCount === 1 ? "rating" : "ratings"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Submission Form for Authenticated Users */}
      {currentUser ? (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-neutral-700/60 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                Write a Review
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                How would you rate this artwork? Select your rating below:
              </p>
            </div>

            {/* Interactive Rating Picker */}
            <div className="flex items-center gap-2 bg-white dark:bg-neutral-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700/60 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium mr-1">
                Rating:
              </span>
              <StarRatingInput value={rating} onChange={setRating} size="md" />
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What did you appreciate most about this piece? Share technique, texture, aesthetic impressions..."
              rows={3}
              className="w-full text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 bg-white dark:bg-black/30 border border-slate-200 dark:border-neutral-700/80 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-[#df6742]/30 focus:border-[#df6742] transition-all resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
              {hasPaid ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Collector
                </span>
              ) : (
                <span>Posting publicly as {currentUser.name || currentUser.email}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="bg-[#df6742] hover:bg-[#c5522f] disabled:bg-slate-300 dark:disabled:bg-neutral-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Submit Review
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-neutral-700/50 rounded-2xl p-5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-slate-800 dark:text-neutral-200">
              Have thoughts on this artwork?
            </p>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Sign in to rate this piece, leave feedback, or connect with the artist.
            </p>
          </div>
          <Link
            href="/login"
            className="bg-[#df6742] hover:bg-[#c5522f] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm shrink-0"
          >
            Sign In to Review
          </Link>
        </div>
      )}

      {/* Reviews List Stream */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-slate-400 dark:text-neutral-500 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#df6742]" />
            Loading collector feedback...
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-3.5">
            {reviews.map((rev) => {
              const authorized = canModifyReview(rev);
              const isCurrentlyEditing = editingId === rev._id;
              const isMenuOpen = openDropdownId === rev._id;
              const isAuthor = currentUser?.email && rev.userEmail && currentUser.email.toLowerCase() === rev.userEmail.toLowerCase();
              const isOwnerModerator = isArtworkOwner || (artworkOwnerEmail && currentUser?.email && artworkOwnerEmail.toLowerCase() === currentUser.email.toLowerCase());

              return (
                <div
                  key={rev._id}
                  className="bg-white dark:bg-black/20 border border-slate-200 dark:border-neutral-700/60 rounded-2xl p-5 space-y-3 transition-all hover:border-slate-300 dark:hover:border-neutral-600 shadow-xs relative"
                >
                  {/* Top Header: User Info, Star Rating, and 3-Dot Action Menu */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3">
                      {rev.userImage ? (
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-neutral-700 shrink-0">
                          <Image
                            src={rev.userImage}
                            alt={rev.userName || "User Avatar"}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-neutral-200 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {(rev.userName || rev.userEmail || "U").charAt(0)}
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-800 dark:text-neutral-100">
                            {rev.userName || "Art Collector"}
                          </span>
                          {rev.userEmail && (
                            <span className="text-[11px] text-slate-400 dark:text-neutral-500 hidden sm:inline">
                              @{rev.userEmail.split("@")[0]}
                            </span>
                          )}
                          {/* Role badges */}
                          {rev.role === "artist" && (
                            <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md font-semibold">
                              Artist
                            </span>
                          )}
                        </div>

                        {/* Star Rating & Time ago */}
                        <div className="flex items-center gap-2.5">
                          <StarRatingDisplay rating={rev.rating || 5} size="xs" />
                          <span className="text-[11px] text-slate-400 dark:text-neutral-400">
                            {formatTimeAgo(rev.createdAt || rev.date)}
                          </span>
                          {rev.updatedAt && (
                            <span className="text-[10px] text-slate-400 italic">
                              (edited)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side: 3-Dot Dropdown Menu for Authorized Users */}
                    {authorized && !isCurrentlyEditing && (
                      <div className="relative" ref={isMenuOpen ? dropdownRef : null}>
                        <button
                          type="button"
                          onClick={() => setOpenDropdownId(isMenuOpen ? null : rev._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                          aria-label="Review actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* 3-Dot Dropdown Menu Popup */}
                        {isMenuOpen && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-[#24333b] border border-slate-200 dark:border-neutral-700 rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                            <button
                              type="button"
                              onClick={() => startEdit(rev)}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-700/60 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
                              Edit Review
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteConfirmation(rev._id)}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              Delete Review
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Body Content or Edit Mode */}
                  {isCurrentlyEditing ? (
                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-neutral-800">
                      {/* Interactive Rating for Edit */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-neutral-400 font-semibold">
                          Edit Rating:
                        </span>
                        <StarRatingInput value={editRating} onChange={setEditRating} size="sm" />
                      </div>

                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                        className="w-full text-sm text-slate-800 dark:text-white bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-neutral-700 rounded-xl p-3 focus:outline-none focus:border-[#df6742] transition-colors resize-none"
                      />

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={savingEdit || !editText.trim()}
                          onClick={() => handleUpdate(rev._id)}
                          className="bg-[#df6742] hover:bg-[#c5522f] disabled:bg-slate-300 dark:disabled:bg-neutral-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          {savingEdit && <Loader2 className="w-3 h-3 animate-spin" />}
                          Save Changes
                        </button>
                        <button
                          type="button"
                          disabled={savingEdit}
                          onClick={() => setEditingId(null)}
                          className="bg-slate-200 hover:bg-slate-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-neutral-200 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pl-12">
                      <p className="text-sm text-slate-700 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                        {rev.text}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-black/10 border border-dashed border-slate-200 dark:border-neutral-700/60 rounded-2xl p-8 text-center space-y-2">
            <Star className="w-8 h-8 text-slate-300 dark:text-neutral-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-neutral-300">
              No reviews yet
            </p>
            <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
              Be the first to share feedback and impressions about this artwork with the community!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;