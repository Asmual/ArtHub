/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { FaTrashAlt, FaEdit, FaThLarge, FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

// Mint a backend-signed JWT (matches verifyToken middleware expectations)
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

  const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");

  useEffect(() => {
    if (authLoading) return;
    if (!user?.email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchMyArtworks = async () => {
      try {
        setLoading(true);

        const token = await getAuthToken(base, user.email);

        // Query catalog filtering directly by the authenticated user's email parameter
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

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this exclusive masterpiece?")) return;
    if (!user?.email) return;

    try {
      const token = await getAuthToken(base, user.email);

      const res = await fetch(`${base}/api/artworks/${id}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!res.ok) throw new Error("Failed to delete the selected artwork.");
     
      toast.success("Masterpiece removed from gallery.");
      setArtworks((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Delete artwork error:", err);
      toast.error(err instanceof Error ? err.message : "Could not execute deletion request.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center text-[var(--text-main)] gap-3">
        <FaSpinner className="animate-spin text-2xl text-[#df6742]" />
        <p className="text-xs text-[var(--text-muted)]">Synchronizing creative vault inventory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 sm:p-10 text-[var(--text-main)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="max-w-5xl mx-auto">
       
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FaThLarge className="text-[#df6742] text-xl" /> Manage Artworks
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">Track and manage your dynamically registered museum inventory records.</p>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border-line)] px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-muted)]">
            Total Inventory: <span className="text-[#df6742] font-bold">{artworks.length} Items</span>
          </div>
        </div>

        {/* Data Grid Table */}
        <div className="bg-[var(--surface)] border border-[var(--border-line)] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--hover-bg)] border-b border-[var(--border-line)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="p-4 pl-6">Artwork</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-line)] text-sm">
                {artworks.map((art) => (
                  <tr key={art._id} className="hover:bg-[var(--hover-bg)] transition-colors duration-150">
                   
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <img src={art.image} alt={art.title} className="w-12 h-12 rounded-lg object-cover bg-[var(--hover-bg)] border border-[var(--border-line)]" />
                      <span className="font-bold text-[var(--text-main)] truncate max-w-45">{art.title}</span>
                    </td>
                   
                    <td className="p-4 text-[var(--text-muted)] font-medium">{art.category}</td>
                   
                    <td className="p-4 font-bold text-[#df6742]">${Number(art.price || 0).toFixed(2)}</td>
                   
                    <td className="p-4">
                      {art.isSold ? (
                        <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
                          <FaTimesCircle /> Sold Out
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
                          <FaCheckCircle /> Available
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 bg-[var(--background)] hover:bg-[var(--hover-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg transition-colors border border-[var(--border-line)]" title="Edit Metadata">
                          <FaEdit className="text-xs" />
                        </button>
                        <button onClick={() => handleDelete(art._id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-rose-400 rounded-lg transition-colors border border-[var(--border-line)]" title="Delete Artwork">
                          <FaTrashAlt className="text-xs" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
         
          {artworks.length === 0 && (
            <p className="text-center text-xs text-[var(--text-subtle)] py-12">No artworks discovered inside your creative dashboard studio.</p>
          )}
        </div>

      </div>
    </div>
  );
}