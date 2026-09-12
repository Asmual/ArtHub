/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldAlert, Trash2, Eye, Loader2, X, Plus, Minus } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";
import { getAuthToken } from "@/lib/auth-utils";

export default function AdminArtworksPage() {
  const router = useRouter();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetArtworkId, setTargetArtworkId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: session, isPending: authLoading } = authClient.useSession();
  const user = session?.user;

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const fetchAllArtworks = useCallback(async () => {
    try {
      setLoading(true);
      let data = null;

      // 1. Try local Next.js internal API first
      try {
        const localRes = await fetch("/api/admin/artworks");
        if (localRes.ok) {
          data = await localRes.json();
        }
      } catch (localErr) {
        console.warn("Local artworks route skipped, trying external gateway:", localErr);
      }

      // 2. Fallback to external backend if needed
      if (!data) {
        const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
        const token = await getAuthToken(user.email);

        const res = await fetch(`${base}/api/admin/artworks`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch artworks.");
        data = await res.json();
      }

      setArtworks(Array.isArray(data) ? data : data?.artworks || data?.data || []);
    } catch (err) {
      console.error("Fetch artworks error:", err);
      toast.error("Failed to load artworks.");
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (authLoading || !user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAllArtworks();
  }, [authLoading, user, fetchAllArtworks]);

  const triggerDeletePrompt = (id) => {
    setTargetArtworkId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!targetArtworkId) return;
    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting artwork...");

    try {
      let deleted = false;

      // 1. Try local API first
      try {
        const localRes = await fetch(`/api/admin/artworks/${targetArtworkId}`, {
          method: "DELETE",
        });
        if (localRes.ok) {
          deleted = true;
        }
      } catch (localErr) {
        console.warn("Local delete skipped, trying external gateway:", localErr);
      }

      // 2. Fallback to external backend
      if (!deleted) {
        const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
        const token = await getAuthToken(user.email);

        const res = await fetch(`${base}/api/admin/artworks/${targetArtworkId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Could not delete artwork from server registry.");
      }

      toast.success("Artwork deleted successfully.", { id: loadingToast });
      setArtworks((prev) => prev.filter((art) => (art._id || art.id) !== targetArtworkId));
      setIsDeleteModalOpen(false);
      setTargetArtworkId(null);
    } catch (err) {
      console.error("Delete artwork error:", err);
      toast.error("Failed to delete artwork.", { id: loadingToast });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuantityChange = async (id, delta) => {
    const currentArtwork = artworks.find(item => (item._id || item.id) === id);
    if (!currentArtwork || !user?.email) return;

    const currentQty = typeof currentArtwork.quantity === "number" ? currentArtwork.quantity : 10;
    const newQuantity = Math.max(0, currentQty + delta);
    const isSold = newQuantity === 0;

    try {
      let updated = false;

      // 1. Try local API first
      try {
        const localRes = await fetch(`/api/admin/artworks/${id}/stock`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newQuantity }),
        });
        if (localRes.ok) {
          updated = true;
        }
      } catch (localErr) {
        console.warn("Local stock update skipped, trying external gateway:", localErr);
      }

      // 2. Fallback to external backend
      if (!updated) {
        const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
        const token = await getAuthToken(user.email);
        const res = await fetch(`${base}/api/admin/artworks/${id}/stock`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            quantity: newQuantity,
          }),
        });

        if (!res.ok) {
          await fetch(`${base}/api/artworks/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              ...currentArtwork,
              quantity: newQuantity,
              isSold,
            }),
          });
        }
      }

      setArtworks((prev) =>
        prev.map((item) => (item._id || item.id) === id ? { ...item, quantity: newQuantity, isSold } : item)
      );
      toast.success(`Stock updated to ${newQuantity}`);
    } catch (err) {
      console.error("Admin update quantity error:", err);
      toast.error("Failed to update stock quantity.");
    }
  };

  if (authLoading || loading) return <Loading />;

  return (
    <div className="space-y-6 w-full p-2 relative" style={{ fontFamily: "'Montserrat', sans-serif" }}>

      {/* Header */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border-line)] flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] tracking-wide">Manage All Artworks</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Review and remove listed artworks from the platform.</p>
        </div>
        <div className="bg-amber-500/10 text-amber-500 p-3 rounded-xl border border-amber-500/20">
          <ShieldAlert size={24} />
        </div>
      </div>

      {/* Artworks Table */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-line)] overflow-hidden shadow-xl">
        <div className="p-5 border-b border-[var(--border-line)] bg-[var(--hover-bg)] flex items-center justify-between">
          <h3 className="font-bold text-[var(--text-main)] text-base uppercase tracking-wider">All Artworks</h3>
          <span className="bg-[#df6742]/10 border border-[#df6742]/20 text-[#df6742] text-xs px-2.5 py-1 rounded-lg font-bold">
            {artworks.length} Total
          </span>
        </div>

        <div className="divide-y divide-[var(--border-line)]">
          {artworks.length === 0 ? (
            <div className="text-center py-12 bg-[var(--hover-bg)]">
              <p className="text-sm text-[var(--text-muted)]">No artworks found.</p>
            </div>
          ) : (
            artworks.map((art) => {
              const currentId = art._id || art.id;
              return (
                <div key={currentId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--hover-bg)] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {art.image && (
                      <img
                        src={art.image}
                        alt={art.title}
                        className="w-12 h-12 rounded-xl object-cover border border-[var(--border-line)] shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <h4 className="font-semibold text-[var(--text-main)] text-sm truncate">{art.title}</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                        By: <span className="text-[var(--text-muted)] font-medium">{art.artistName || "Unknown"}</span>
                        {art.category && (
                          <span className="ml-2 text-[var(--text-subtle)]">· {art.category}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-auto sm:ml-0 shrink-0">
                    <span className="text-sm font-black text-[#df6742]">${art.price}</span>

                    {/* Stock Increment / Decrement */}
                    <div className="flex items-center gap-1.5 bg-[var(--background)] px-2 py-1 rounded-xl border border-[var(--border-line)]">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(currentId, -1)}
                        disabled={(typeof art.quantity === "number" ? art.quantity : 10) <= 0}
                        className="p-1 rounded hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition-colors disabled:opacity-30 cursor-pointer"
                        title="Decrease Stock"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-bold text-xs min-w-5 text-center text-[var(--text-main)]">
                        {typeof art.quantity === "number" ? art.quantity : 10}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(currentId, 1)}
                        className="p-1 rounded hover:bg-emerald-500/20 text-[var(--text-muted)] hover:text-emerald-400 transition-colors cursor-pointer"
                        title="Increase Stock"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded border tracking-wider ${
                      art.isSold || (typeof art.quantity === "number" && art.quantity <= 0)
                        ? "bg-red-500/10 text-red-400 border-red-500/15"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
                    }`}>
                      {art.isSold || (typeof art.quantity === "number" && art.quantity <= 0) ? "Sold Out" : "Available"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => router.push(`/browse/${currentId}`)}
                      title="View Artwork"
                      className="p-2 rounded-lg bg-[var(--hover-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-line)] transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => triggerDeletePrompt(currentId)}
                      title="Delete Artwork"
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--surface)] border border-[var(--border-line)] w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => { if (!isDeleting) setIsDeleteModalOpen(false); }}
              className="absolute top-4 right-4 text-[var(--text-subtle)] hover:text-[var(--text-main)] transition-colors"
              disabled={isDeleting}
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-main)] tracking-wide">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Are you sure you want to permanently delete this artwork? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-[var(--hover-bg)] border border-[var(--border-line)] hover:bg-[var(--border-line)] text-xs font-semibold rounded-xl text-[var(--text-main)] transition-all uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-semibold rounded-xl text-white shadow-lg transition-all uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <><Loader2 size={14} className="animate-spin" /> Deleting...</>
                ) : (
                  "Delete Artwork"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}