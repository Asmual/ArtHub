/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaTrashAlt, FaEdit, FaThLarge, FaSpinner, FaUpload, FaEye, FaPlus, FaMinus } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

const getAuthToken = async (base, email) => {
  const res = await fetch(`${base}/api/users/generate-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Token generation failed.");
  const { token } = await res.json();
  return token;
};

export default function ManageArtworksPage() {
  const { data: session, isPending: authLoading } = authClient.useSession();
  const user = session?.user;

  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editArtwork, setEditArtwork] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
  const imgbbApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  useEffect(() => {
    if (authLoading) return;
    if (!user?.email) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchMyArtworks = async () => {
      try {
        setLoading(true);
        const token = await getAuthToken(base, user.email);

        const res = await fetch(`${base}/api/artworks?email=${encodeURIComponent(user.email)}`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned HTML instead of JSON. Please check backend endpoint.");
        }

        if (!res.ok) throw new Error("Failed to load your exhibition inventory.");
        const data = await res.json();

        if (isMounted) {
          const artworkList = data && Array.isArray(data.artworks) ? data.artworks : (Array.isArray(data) ? data : []);
          setArtworks(artworkList);
        }
      } catch (err) {
        console.error("Fetch inventory error:", err);
        toast.error(err instanceof Error ? err.message : "Failed to retrieve artwork records.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMyArtworks();
    return () => { isMounted = false; };
  }, [authLoading, user, base]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!imgbbApiKey) {
      toast.error("imgBB API Key is missing in your environment variables!");
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setEditArtwork((prev) => ({ ...prev, image: data.data.url }));
        toast.success("New image uploaded successfully to imgBB!");
      } else {
        throw new Error(data.error?.message || "Failed to upload image.");
      }
    } catch (err) {
      console.error("imgBB Upload Error:", err);
      toast.error("Image upload failed. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleQuantityChange = async (id, delta) => {
    if (!user?.email) return;
    const currentArtwork = artworks.find(item => item._id === id);
    if (!currentArtwork) return;

    const currentQty = typeof currentArtwork.quantity === "number" ? currentArtwork.quantity : 1;
    const newQuantity = Math.max(0, currentQty + delta);
    const isSold = newQuantity === 0;

    try {
      const token = await getAuthToken(base, user.email);
      const res = await fetch(`${base}/api/artworks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...currentArtwork,
          quantity: newQuantity,
          isSold: isSold
        }),
      });

      if (!res.ok) throw new Error("Failed to update stock quantity.");

      setArtworks((prev) =>
        prev.map((item) => (item._id === id ? { ...item, quantity: newQuantity, isSold } : item))
      );
      toast.success(`Stock updated to ${newQuantity}`);
    } catch (err) {
      console.error("Update quantity error:", err);
      toast.error("Could not update product stock quantity.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!user?.email) return;
    const isSold = newStatus === "sold";
    const currentArtwork = artworks.find(item => item._id === id);

    try {
      const token = await getAuthToken(base, user.email);
      const res = await fetch(`${base}/api/artworks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...currentArtwork,
          isSold: isSold
        }),
      });

      if (!res.ok) throw new Error("Failed to update status.");

      setArtworks((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isSold } : item))
      );
      toast.success("Artwork status updated successfully.");
    } catch (err) {
      console.error("Update status error:", err);
      toast.error("Could not update product status.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId || !user?.email) return;

    try {
      const token = await getAuthToken(base, user.email);
      const res = await fetch(`${base}/api/artworks/${deleteId}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!res.ok) throw new Error("Failed to delete the selected artwork.");

      toast.success("Masterpiece removed from gallery.");
      setArtworks((prev) => prev.filter((item) => item._id !== deleteId));
    } catch (err) {
      console.error("Delete artwork error:", err);
      toast.error(err instanceof Error ? err.message : "Could not execute deletion request.");
    } finally {
      setDeleteId(null);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editArtwork || !user?.email) return;

    try {
      setSubmitting(true);
      const token = await getAuthToken(base, user.email);

      const res = await fetch(`${base}/api/artworks/${editArtwork._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editArtwork.title,
          category: editArtwork.category,
          price: Number(editArtwork.price),
          quantity: Number(editArtwork.quantity ?? 1),
          image: editArtwork.image,
          description: editArtwork.description,
          isSold: Number(editArtwork.quantity) === 0 ? true : editArtwork.isSold
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save artwork update.");
      }

      const updatedData = await res.json();
      const finalDoc = updatedData.data || updatedData;

      setArtworks((prev) =>
        prev.map((item) => (item._id === editArtwork._id ? { ...item, ...finalDoc } : item))
      );

      toast.success("Artwork details saved gracefully.");
      setEditArtwork(null);
    } catch (err) {
      console.error("Edit profile save error:", err);
      toast.error(err instanceof Error ? err.message : "Could not complete update request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-(--background) flex flex-col items-center justify-center text-(--text-main) gap-3">
        <FaSpinner className="animate-spin text-2xl text-[#df6742]" />
        <p className="text-xs text-(--text-muted)">Synchronizing creative vault inventory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--background) p-6 sm:p-10 text-(--text-main)" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FaThLarge className="text-[#df6742] text-xl" /> Manage Artworks
            </h1>
            <p className="text-xs text-(--text-muted) mt-1">Track and manage your dynamically registered museum inventory records.</p>
          </div>
          <div className="bg-(--surface) border border-(--border-line) px-4 py-2.5 rounded-xl text-xs font-semibold text-(--text-muted)">
            Total Inventory: <span className="text-[#df6742] font-bold">{artworks.length} Items</span>
          </div>
        </div>

        <div className="bg-(--surface) border border-(--border-line) rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-(--hover-bg) border-b border-(--border-line) text-[11px] font-bold uppercase tracking-wider text-(--text-muted)">
                  <th className="p-4 pl-6">Artwork</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-center">Stock / Qty</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border-line) text-sm">
                {artworks.map((art) => {
                  const stockQty = typeof art.quantity === "number" ? art.quantity : 1;
                  return (
                    <tr key={art._id} className="hover:bg-(--hover-bg) transition-colors duration-150">

                      <td className="p-4 pl-6 flex items-center gap-3">
                        <img src={art.image} alt={art.title} className="w-12 h-12 rounded-lg object-cover bg-(--hover-bg) border border-(--border-line)" />
                        <span className="font-bold text-(--text-main) truncate max-w-44">{art.title}</span>
                      </td>

                      <td className="p-4 text-(--text-muted) font-medium">{art.category}</td>

                      <td className="p-4 font-bold text-[#df6742]">${Number(art.price || 0).toFixed(2)}</td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(art._id, -1)}
                            disabled={stockQty <= 0}
                            className="p-1.5 bg-(--background) hover:bg-red-500/20 text-(--text-muted) hover:text-red-400 rounded-lg border border-(--border-line) disabled:opacity-40 transition-colors"
                            title="Decrease Stock"
                          >
                            <FaMinus className="text-[10px]" />
                          </button>
                          
                          <span className="font-bold text-xs px-2 min-w-6 text-center text-(--text-main)">
                            {stockQty}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleQuantityChange(art._id, 1)}
                            className="p-1.5 bg-(--background) hover:bg-emerald-500/20 text-(--text-muted) hover:text-emerald-400 rounded-lg border border-(--border-line) transition-colors"
                            title="Increase Stock"
                          >
                            <FaPlus className="text-[10px]" />
                          </button>
                        </div>
                      </td>

                      <td className="p-4">
                        <select
                          value={art.isSold || stockQty === 0 ? "sold" : "available"}
                          onChange={(e) => handleStatusChange(art._id, e.target.value)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-md uppercase border cursor-pointer outline-none transition-all ${
                            art.isSold || stockQty === 0
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          <option value="available" className="bg-surface text-foreground">Available</option>
                          <option value="sold" className="bg-(--surface) text-(--text-main)">Sold Out</option>
                        </select>
                      </td>

                      <td className="p-4 text-center pr-6">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/browse/${art._id}`}
                            className="p-2 bg-(--background) hover:bg-(--hover-bg) text-(--text-muted) hover:text-[#df6742] rounded-lg transition-colors border border-(--border-line)"
                            title="View Artwork Details"
                          >
                            <FaEye className="text-xs" />
                          </Link>

                          <button
                            onClick={() => setEditArtwork(art)}
                            className="p-2 bg-(--background) hover:bg-(--hover-bg) text-(--text-muted) hover:text-(--text-main) rounded-lg transition-colors border border-(--border-line)"
                            title="Edit Metadata"
                          >
                            <FaEdit className="text-xs" />
                          </button>

                          <button
                            onClick={() => setDeleteId(art._id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-rose-400 rounded-lg transition-colors border border-(--border-line)"
                            title="Delete Artwork"
                          >
                            <FaTrashAlt className="text-xs" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {artworks.length === 0 && (
            <p className="text-center text-xs text-(--text-subtle) py-12">No artworks discovered inside your creative dashboard studio.</p>
          )}
        </div>

      </div>

      {editArtwork && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-(--surface) border border-(--border-line) rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-(--text-main)">
            <div className="p-5 border-b border-(--border-line) flex items-center justify-between">
              <h2 className="text-base font-bold text-(--text-main) flex items-center gap-2">
                <FaEdit className="text-[#df6742]" /> Edit Artwork Properties
              </h2>
              <button type="button" onClick={() => setEditArtwork(null)} className="text-xs font-semibold text-(--text-muted) hover:text-(--text-main) transition-colors">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-(--text-muted) mb-1">Artwork Title</label>
                <input
                  type="text"
                  required
                  value={editArtwork.title || ""}
                  onChange={(e) => setEditArtwork({...editArtwork, title: e.target.value})}
                  className="w-full bg-(--background) border border-(--border-line) px-3 py-2 rounded-xl text-xs outline-none focus:border-[#df6742] text-(--text-main) font-medium transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-(--text-muted) mb-1">Category</label>
                  <input
                    type="text"
                    value={editArtwork.category || ""}
                    onChange={(e) => setEditArtwork({...editArtwork, category: e.target.value})}
                    className="w-full bg-(--background) border border-(--border-line) px-3 py-2 rounded-xl text-xs outline-none focus:border-[#df6742] text-(--text-main) font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-(--text-muted) mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editArtwork.price || ""}
                    onChange={(e) => setEditArtwork({...editArtwork, price: e.target.value})}
                    className="w-full bg-(--background) border border-(--border-line) px-3 py-2 rounded-xl text-xs outline-none focus:border-[#df6742] text-(--text-main) font-bold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-(--text-muted) mb-1">Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editArtwork.quantity ?? 1}
                    onChange={(e) => setEditArtwork({...editArtwork, quantity: e.target.value})}
                    className="w-full bg-(--background) border border-(--border-line) px-3 py-2 rounded-xl text-xs outline-none focus:border-[#df6742] text-(--text-main) font-bold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-(--text-muted) mb-1">Artwork Image</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-(--background) border border-(--border-line) rounded-xl">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-(--border-line) bg-(--hover-bg) flex items-center justify-center shrink-0">
                    {editArtwork.image ? (
                      <img src={editArtwork.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-(--text-muted) text-center px-1">No Image</span>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <FaSpinner className="animate-spin text-white text-sm" />
                      </div>
                    )}
                  </div>

                  <div className="w-full">
                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-(--border-line) hover:border-[#df6742] rounded-xl cursor-pointer bg-(--surface) transition-all">
                      <div className="flex flex-col items-center justify-center pt-3 pb-3">
                        <FaUpload className="text-(--text-muted) text-sm mb-1" />
                        <p className="text-[10px] text-(--text-muted) font-medium">Click to upload new image</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                    {editArtwork.image && (
                      <p className="text-[10px] text-emerald-400 mt-1 truncate font-mono max-w-xs">✓ URL: {editArtwork.image}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-(--text-muted) mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editArtwork.description || ""}
                  onChange={(e) => setEditArtwork({...editArtwork, description: e.target.value})}
                  className="w-full bg-(--background) border border-(--border-line) px-3 py-2 rounded-xl text-xs outline-none focus:border-[#df6742] text-(--text-main) font-medium transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-(--border-line)">
                <button
                  type="button"
                  onClick={() => setEditArtwork(null)}
                  className="px-4 py-2 bg-(--background) border border-(--border-line) rounded-xl text-xs font-semibold hover:bg-(--hover-bg) transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="px-4 py-2 bg-[#df6742] hover:bg-[#c95633] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-[#df6742]/10 disabled:opacity-50"
                >
                  {submitting ? <FaSpinner className="animate-spin" /> : "Save Updates"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-(--surface) border border-(--border-line) rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <FaTrashAlt className="text-lg" />
            </div>
            <h3 className="text-sm font-bold text-(--text-main)">Remove Masterpiece?</h3>
            <p className="text-xs text-(--text-muted) mt-1.5 leading-relaxed">Are you completely sure you want to delete this listing from your exclusive showroom catalog?</p>

            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 flex-1 bg-(--background) border border-(--border-line) rounded-xl text-xs font-semibold hover:bg-(--hover-bg) transition-colors text-(--text-main)"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-500/10"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}