/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

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

  return date.toLocaleDateString();
};

// Helper to retrieve JWT token for authenticated requests
const getAuthToken = async (base, email) => {
  const res = await fetch(`${base}/api/users/generate-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Authentication token generation failed.");
  const { token } = await res.json();
  return token;
};

const ReviewSection = ({ artworkId, currentUser, hasPaid, isAdmin, isArtist }) => {
  const [reviews, setReviews] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetedDeleteId, setTargetedDeleteId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [, setTimeTicker] = useState(Date.now());

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com";
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  const triggerToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const fetchReviews = useCallback(async () => {
    if (!artworkId) return;
    try {
      const response = await fetch(`${cleanBaseUrl}/api/reviews/${artworkId}`);
      const data = await response.json();
      if (Array.isArray(data)) setReviews(data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading reviews query stream:", error);
      setLoading(false);
    }
  }, [artworkId, cleanBaseUrl]);

  useEffect(() => {
    fetchReviews();
    
    
    const tickerInterval = setInterval(() => {
      setTimeTicker((_) => Date.now());
    }, 30000);
    
    return () => clearInterval(tickerInterval);
  }, [fetchReviews]);

  // Submit new review comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !text.trim()) return;

    try {
      const token = await getAuthToken(cleanBaseUrl, currentUser.email);
      const response = await fetch(`${cleanBaseUrl}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          artworkId,
          userEmail: currentUser.email,
          userName: currentUser.name,
          userImage: currentUser.image || "",
          text: text.trim(),
        }),
      });

      if (response.ok) {
        setText("");
        fetchReviews();
        triggerToast("Comment posted successfully!");
      } else {
        const errData = await response.json().catch(() => ({}));
        triggerToast(errData.message || "Failed to post comment.");
      }
    } catch (error) {
      console.error("[REVIEW ERROR] Post review error:", error);
      triggerToast("Error posting comment.");
    }
  };

  // Update existing review comment
  const handleUpdate = async (reviewId) => {
    if (!editText.trim() || !currentUser) return;
    try {
      const token = await getAuthToken(cleanBaseUrl, currentUser.email);
      const response = await fetch(`${cleanBaseUrl}/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: editText.trim(),
        }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditText("");
        fetchReviews();
        triggerToast("Comment updated successfully!");
      } else {
        const errData = await response.json().catch(() => ({}));
        triggerToast(errData.message || "Failed to update comment.");
      }
    } catch (error) {
      console.error("[REVIEW ERROR] Update review error:", error);
    }
  };

  const openDeleteConfirmation = (reviewId) => {
    setTargetedDeleteId(reviewId);
    setShowDeleteModal(true);
  };

  // Delete review comment
  const executeDelete = async () => {
    if (!targetedDeleteId || !currentUser) return;
    try {
      const token = await getAuthToken(cleanBaseUrl, currentUser.email);
      const response = await fetch(`${cleanBaseUrl}/api/reviews/${targetedDeleteId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setTargetedDeleteId(null);
        fetchReviews();
        triggerToast("Successfully deleted comment!");
      } else {
        const errData = await response.json().catch(() => ({}));
        triggerToast(errData.message || "Failed to delete comment.");
      }
    } catch (error) {
      console.error("[REVIEW ERROR] Delete review error:", error);
    }
  };

  return (
    <div className="space-y-6 relative">
      {showToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#df6742] text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#2f3f48] p-6 rounded-2xl max-w-md w-full space-y-4 border border-slate-200 dark:border-neutral-500/20">
            <h3 className="text-lg font-bold text-slate-800 dark:text-neutral-100">Delete Comment</h3>
            <p className="text-sm text-slate-600 dark:text-neutral-300">Are you sure you want to permanently delete this comment?</p>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => { setShowDeleteModal(false); setTargetedDeleteId(null); }} className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-white text-xs font-bold px-4 py-2 rounded-lg">Cancel</button>
              <button onClick={executeDelete} className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-slate-800 dark:text-white">Reviews & Comments ({reviews.length})</h2>

      {currentUser ? (
        hasPaid ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your thoughts about this artwork..."
              rows={3}
              className="w-full text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-400 bg-slate-100 dark:bg-black/10 border border-slate-300 dark:border-neutral-500/40 rounded-xl p-3 focus:outline-none focus:border-[#df6742] resize-none"
            />
            <button type="submit" className="bg-[#df6742] hover:bg-[#c5522f] text-white text-xs font-bold px-5 py-2.5 rounded-lg">Post Comment</button>
          </form>
        ) : (
          <div className="bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-neutral-500/20 rounded-xl p-4 text-sm text-slate-600 dark:text-neutral-300">
            {isAdmin || isArtist ? (
              <span className="text-slate-400 dark:text-neutral-400 italic">Comments and creation submission fields are restricted for Administration and Creators.</span>
            ) : (
              <span>You must purchase this artwork to unlock review and feedback submission channels.</span>
            )}
          </div>
        )
      ) : (
        <div className="bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-neutral-500/20 rounded-xl p-4 text-sm text-slate-600 dark:text-neutral-300">
          Please <Link href="/login" className="font-bold text-[#df6742] hover:underline mx-1">Sign In</Link> to interact with the catalog.
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-slate-500 dark:text-neutral-400 text-sm animate-pulse">Loading comments stream...</p>
        ) : reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((rev) => {
              const isOwner = currentUser?.email === rev.userEmail;
              const isCurrentlyEditing = editingId === rev._id;

              return (
                <div key={rev._id} className="bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-neutral-500/10 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-neutral-400">
                    <div className="flex items-center gap-2">
                      {rev.userImage && (
                        <div className="relative w-5 h-5 rounded-full overflow-hidden border border-slate-200 dark:border-neutral-500/20">
                          <Image src={rev.userImage} alt="" fill sizes="20px" className="object-cover" />
                        </div>
                      )}
                      <span className="font-bold text-slate-700 dark:text-neutral-200">{rev.userName}</span>
                    </div>
                    <span>{formatTimeAgo(rev.createdAt || rev.date)}</span>
                  </div>

                  {isCurrentlyEditing ? (
                    <div className="space-y-2 pt-1">
                      <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2} className="w-full text-sm text-slate-800 dark:text-white bg-slate-100 dark:bg-black/20 border border-slate-300 dark:border-neutral-500/40 rounded-lg p-2 focus:outline-none focus:border-[#df6742] resize-none" />
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleUpdate(rev._id)} className="bg-[#df6742] text-white text-[11px] font-bold px-3 py-1.5 rounded">Save Changes</button>
                        <button onClick={() => setEditingId(null)} className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-neutral-300 text-[11px] font-bold px-3 py-1.5 rounded">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-sm text-slate-600 dark:text-neutral-300 whitespace-pre-wrap">{rev.text}</p>
                     
                      {(isOwner || isAdmin) && (
                        <div className="flex items-center gap-2 shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                          {isOwner && (
                            <>
                              <button onClick={() => { setEditingId(rev._id); setEditText(rev.text); }} className="text-xs text-slate-500 dark:text-neutral-400 hover:text-[#df6742]">Edit</button>
                              <span className="text-slate-300 dark:text-neutral-600 text-xs">|</span>
                            </>
                          )}
                          <button onClick={() => openDeleteConfirmation(rev._id)} className="text-xs text-slate-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400">Delete</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-neutral-400 text-sm italic pl-1">No comments or reviews have been posted yet.</p>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;