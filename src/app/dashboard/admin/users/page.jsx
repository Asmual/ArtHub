/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Users, Mail, Calendar, Search, ShieldCheck, UserCheck, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import Loading from "@/app/loading";
import { getAuthToken } from "@/lib/auth-utils";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getRoleBadge = (role) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return "bg-rose-500/20 text-rose-400 font-bold text-[10px] uppercase border border-rose-500/30";
    case "artist":
      return "bg-amber-500/20 text-amber-400 font-bold text-[10px] uppercase border border-amber-500/30";
    default:
      return "bg-blue-500/20 text-blue-400 font-bold text-[10px] uppercase border border-blue-500/30";
  }
};

export default function AdminUsersDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: session, isPending: authLoading } = authClient.useSession();
  const user = session?.user;

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const fetchAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      let userData = null;

      // 1. Try local Next.js internal API first
      try {
        const localRes = await fetch("/api/admin/users");
        if (localRes.ok) {
          userData = await localRes.json();
        }
      } catch (localErr) {
        console.warn("Local users route skipped, trying external gateway:", localErr);
      }

      // 2. Fallback to external backend if needed
      if (!userData) {
        const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
        const token = await getAuthToken(user.email);

        const res = await fetch(`${base}/api/admin/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load users.");
        userData = await res.json();
      }

      setUsers(Array.isArray(userData) ? userData : userData?.users || userData?.data || []);
    } catch (err) {
      console.error("Fetch users error:", err);
      toast.error("Could not load users.");
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (authLoading || !user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAllUsers();
  }, [authLoading, user, fetchAllUsers]);

  const handleRoleChangeTrigger = (u, newRole) => {
    if (!newRole || u.role === newRole) return;
    setTargetUser(u);
    setSelectedNewRole(newRole);
    setIsModalOpen(true);
  };

  const confirmRoleMutation = async () => {
    if (!targetUser || !selectedNewRole) return;
    setIsUpdating(true);
    const userId = targetUser._id || targetUser.id;
    const loadingToast = toast.loading(`Updating role to ${selectedNewRole}...`);

    try {
      let updated = false;

      // 1. Try local API first
      try {
        const localRes = await fetch(`/api/admin/users/${userId}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: selectedNewRole }),
        });
        if (localRes.ok) {
          updated = true;
        }
      } catch (localErr) {
        console.warn("Local role update skipped, trying external gateway:", localErr);
      }

      // 2. Fallback to external backend
      if (!updated) {
        const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
        const token = await getAuthToken(user.email);

        const res = await fetch(`${base}/api/admin/users/${userId}/role`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ role: selectedNewRole }),
        });

        if (!res.ok) throw new Error("Role update rejected by server.");
      }

      toast.success(`${targetUser.name || "User"} role updated to ${selectedNewRole}`, { id: loadingToast });

      setUsers((prev) =>
        prev.map((u) => ((u._id || u.id) === userId ? { ...u, role: selectedNewRole } : u))
      );
      setIsModalOpen(false);
      setTargetUser(null);
    } catch (err) {
      console.error("Role update error:", err);
      toast.error("Failed to update role.", { id: loadingToast });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u?.name?.toLowerCase().includes(q) ||
      u?.email?.toLowerCase().includes(q) ||
      u?.role?.toLowerCase().includes(q)
    );
  });

  if (authLoading || loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)] p-4 sm:p-8 relative" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border-line)] shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#df6742]/10 text-[#df6742] rounded-xl border border-[#df6742]/20">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wide text-[var(--text-main)]">User Registry</h1>
              <p className="text-xs text-[var(--text-muted)]">Manage and audit user roles within the ArtHub platform</p>
            </div>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" size={16} />
            <input
              type="text"
              placeholder="Search by name, email or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--background)] border border-[var(--border-line)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#df6742] rounded-xl transition-all"
            />
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-[var(--surface)] rounded-2xl border border-[var(--border-line)] shadow-xl">
            <p className="text-sm text-[var(--text-muted)]">No matching users found.</p>
          </div>
        ) : (
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-line)] overflow-hidden shadow-xl">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-line)] text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-wider bg-[var(--hover-bg)]">
                    <th className="py-4 pl-6">User</th>
                    <th className="py-4">Email</th>
                    <th className="py-4">Role</th>
                    <th className="py-4">Tier</th>
                    <th className="py-4">Joined</th>
                    <th className="py-4 pr-6 text-right">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-line)] text-xs sm:text-sm">
                  {filteredUsers.map((u, idx) => {
                    const initials = u.name
                      ? u.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
                      : "U";
                    const avatar = u.profileImage || u.image;

                    return (
                      <tr key={u._id || idx} className="hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-main)]">
                        <td className="py-4 pl-6">
                          <div className="flex items-center gap-3">
                            {avatar ? (
                              <img src={avatar} alt={u.name || "User"} className="w-9 h-9 rounded-full object-cover border border-[var(--border-line)]" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#df6742] to-[#b34928] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {initials}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-[var(--text-main)] truncate max-w-40">{u.name || "Anonymous"}</p>
                              <p className="text-[10px] text-[var(--text-subtle)] font-mono mt-0.5 truncate max-w-35">ID: {u._id || u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-[var(--text-muted)]">
                          <div className="flex items-center gap-1.5 max-w-50 truncate">
                            <Mail size={13} className="text-[var(--text-subtle)] shrink-0" />
                            <span className="truncate">{u.email || "N/A"}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`${getRoleBadge(u.role)} py-1 px-2.5 rounded-md`}>
                            {u.role || "user"}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 uppercase">
                            {u.subscriptionTier || "free"}
                          </span>
                        </td>
                        <td className="py-4 text-[var(--text-subtle)] font-mono text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-[var(--text-subtle)]" />
                            <span>{formatDate(u.createdAt || u.updatedAt)}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-6 text-right">
                          <select
                            value={u.role || "user"}
                            onChange={(e) => handleRoleChangeTrigger(u, e.target.value)}
                            className="bg-[var(--background)] border border-[var(--border-line)] text-[var(--text-main)] text-[11px] font-bold py-1.5 px-2.5 rounded-xl outline-none focus:border-[#df6742] cursor-pointer transition-colors"
                          >
                            <option value="user">User</option>
                            <option value="artist">Artist</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Role Change Confirmation Modal */}
      {isModalOpen && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--surface)] border border-[var(--border-line)] w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => { if (!isUpdating) setIsModalOpen(false); }}
              className="absolute top-4 right-4 text-[var(--text-subtle)] hover:text-[var(--text-main)] transition-colors"
              disabled={isUpdating}
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-main)] tracking-wide">Confirm Role Change</h3>
            </div>
            <div className="text-xs text-[var(--text-muted)] leading-relaxed space-y-2">
              <p>
                Changing role for:
                <span className="text-[var(--text-main)] font-bold block mt-1 text-sm bg-[var(--hover-bg)] p-2 rounded-xl border border-[var(--border-line)]">
                  {targetUser.name} ({targetUser.email})
                </span>
              </p>
              <p className="pt-1">
                From <span className="text-[#df6742] font-black uppercase">{targetUser.role || "user"}</span> to{" "}
                <span className="text-emerald-400 font-black uppercase">{selectedNewRole}</span>.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isUpdating}
                className="px-4 py-2 bg-[var(--hover-bg)] border border-[var(--border-line)] hover:bg-[var(--border-line)] text-xs font-semibold rounded-xl text-[var(--text-main)] transition-all uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={confirmRoleMutation}
                disabled={isUpdating}
                className="px-4 py-2 bg-[#df6742] hover:bg-[#b34928] text-xs font-semibold rounded-xl text-white shadow-lg transition-all uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
              >
                {isUpdating ? (
                  <><Loader2 size={14} className="animate-spin" /> Updating...</>
                ) : (
                  <><UserCheck size={14} /> Confirm</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}