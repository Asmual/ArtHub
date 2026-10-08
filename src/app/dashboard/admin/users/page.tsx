/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Users, Mail, Calendar, Search, ShieldCheck, UserCheck, X, Trash2, Ban, ShieldAlert, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import DashboardContentLoader from "@/components/dashboard/DashboardContentLoader";
import { getAuthToken } from "@/lib/auth-utils";
import AppSpinner from "@/components/shared/AppSpinner";

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

  // Role mutation modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete user modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Block / Unblock artist or user
  const handleToggleBlock = async (u) => {
    const userId = u._id || u.id;
    const nextBlockedState = !u.isBlocked;
    const actionText = nextBlockedState ? "Blocking" : "Unblocking";
    const loadingToast = toast.loading(`${actionText} ${u.name || "user"}...`);

    try {
      let updated = false;

      // 1. Try local Next.js API
      try {
        const localRes = await fetch(`/api/admin/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isBlocked: nextBlockedState }),
        });
        if (localRes.ok) updated = true;
      } catch (e) {
        console.warn("Local block user fallback:", e.message);
      }

      // 2. Try external backend
      if (!updated) {
        const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
        const token = await getAuthToken(user.email);

        const res = await fetch(`${base}/api/admin/users/${userId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isBlocked: nextBlockedState }),
        });
        if (res.ok) updated = true;
        else throw new Error("Server rejected status change");
      }

      toast.success(
        nextBlockedState
          ? `${u.name || "User"} has been blocked.`
          : `${u.name || "User"} is now active.`,
        { id: loadingToast }
      );

      setUsers((prev) =>
        prev.map((item) =>
          (item._id || item.id) === userId
            ? { ...item, isBlocked: nextBlockedState, status: nextBlockedState ? "blocked" : "active" }
            : item
        )
      );
    } catch (err) {
      console.error("Toggle block error:", err);
      toast.error("Failed to update user status.", { id: loadingToast });
    }
  };

  // Delete user trigger
  const triggerDeletePrompt = (u) => {
    setUserToDelete(u);
    setDeleteModalOpen(true);
  };

  // Execute delete user
  const executeDeleteUser = async () => {
    if (!userToDelete) return;
    const userId = userToDelete._id || userToDelete.id;
    setIsDeleting(true);
    const loadingToast = toast.loading(`Deleting ${userToDelete.name || "user"}...`);

    try {
      let deleted = false;

      // 1. Try local API first
      try {
        const localRes = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
        });
        if (localRes.ok) deleted = true;
      } catch (e) {
        console.warn("Local delete user fallback:", e.message);
      }

      // 2. Try external backend
      if (!deleted) {
        const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
        const token = await getAuthToken(user.email);

        const res = await fetch(`${base}/api/admin/users/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) deleted = true;
        else throw new Error("Server rejected user deletion");
      }

      toast.success("User removed successfully.", { id: loadingToast });
      setUsers((prev) => prev.filter((item) => (item._id || item.id) !== userId));
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Delete user error:", err);
      toast.error("Failed to delete user.", { id: loadingToast });
    } finally {
      setIsDeleting(false);
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

  if (authLoading || loading) {
    return <DashboardContentLoader text="Loading user directory..." />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)] p-4 sm:p-8 relative" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="w-full space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border-line)] shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#df6742]/10 text-[#df6742] rounded-xl border border-[#df6742]/20">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wide text-[var(--text-main)]">User & Artist Registry</h1>
              <p className="text-xs text-[var(--text-muted)]">Audit roles, manage artist permissions, block, or delete platform accounts</p>
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
                  <tr className="border-b border-[var(--border-line)] bg-[var(--hover-bg)] text-[11px] uppercase tracking-wider text-[var(--text-subtle)]">
                    <th className="py-4 pl-6">Profile</th>
                    <th className="py-4">Role</th>
                    <th className="py-4">Status</th>
                    <th className="py-4">Plan</th>
                    <th className="py-4">Joined</th>
                    <th className="py-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-line)] text-xs">
                  {filteredUsers.map((u) => {
                    const currentId = u._id || u.id;
                    const isBlocked = Boolean(u.isBlocked || u.status === "blocked");

                    return (
                      <tr key={currentId} className="hover:bg-[var(--hover-bg)] transition-colors">
                        <td className="py-4 pl-6">
                          <div className="flex items-center gap-3">
                            {u.image ? (
                              <img
                                src={u.image}
                                alt={u.name || "User"}
                                className="w-9 h-9 rounded-full object-cover border border-[var(--border-line)] shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#df6742] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {(u.name || u.email || "U").charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-bold text-[var(--text-main)] block truncate">
                                {u.name || "Unnamed User"}
                              </span>
                              <div className="flex items-center gap-1.5 max-w-50 truncate text-[var(--text-subtle)]">
                                <Mail size={11} className="shrink-0" />
                                <span className="truncate">{u.email || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`${getRoleBadge(u.role)} py-1 px-2.5 rounded-md`}>
                            {u.role || "user"}
                          </span>
                        </td>
                        <td className="py-4">
                          {isBlocked ? (
                            <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 uppercase inline-flex items-center gap-1">
                              <Ban size={10} /> Blocked
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase inline-flex items-center gap-1">
                              <CheckCircle size={10} /> Active
                            </span>
                          )}
                        </td>
                        <td className="py-4">
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 uppercase">
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
                          <div className="flex items-center justify-end gap-2">
                            {/* Role Selector */}
                            <select
                              value={u.role || "user"}
                              onChange={(e) => handleRoleChangeTrigger(u, e.target.value)}
                              className="bg-[var(--background)] border border-[var(--border-line)] text-[var(--text-main)] text-[11px] font-bold py-1 px-2 rounded-lg outline-none focus:border-[#df6742] cursor-pointer transition-colors"
                            >
                              <option value="user">User</option>
                              <option value="artist">Artist</option>
                              <option value="admin">Admin</option>
                            </select>

                            {/* Block / Unblock Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleBlock(u)}
                              title={isBlocked ? "Unblock user" : "Block user"}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isBlocked
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                  : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                              }`}
                            >
                              <Ban size={14} />
                            </button>

                            {/* Delete User Button */}
                            <button
                              type="button"
                              onClick={() => triggerDeletePrompt(u)}
                              title="Delete user"
                              className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
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
              className="absolute top-4 right-4 text-[var(--text-subtle)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
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
                className="px-4 py-2 bg-[var(--hover-bg)] border border-[var(--border-line)] hover:bg-[var(--border-line)] text-xs font-semibold rounded-xl text-[var(--text-main)] transition-all uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmRoleMutation}
                disabled={isUpdating}
                className="px-4 py-2 bg-[#df6742] hover:bg-[#b34928] text-xs font-semibold rounded-xl text-white shadow-lg transition-all uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isUpdating ? (
                  <>
                    <AppSpinner size="small" /> Updating...
                  </>
                ) : (
                  <><UserCheck size={14} /> Confirm</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--surface)] border border-[var(--border-line)] w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => { if (!isDeleting) setDeleteModalOpen(false); }}
              className="absolute top-4 right-4 text-[var(--text-subtle)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              disabled={isDeleting}
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-main)] tracking-wide">Delete User Account</h3>
            </div>
            <div className="text-xs text-[var(--text-muted)] leading-relaxed space-y-2">
              <p>
                Are you sure you want to permanently delete:
                <span className="text-[var(--text-main)] font-bold block mt-1 text-sm bg-[var(--hover-bg)] p-2 rounded-xl border border-[var(--border-line)]">
                  {userToDelete.name || "User"} ({userToDelete.email})
                </span>
              </p>
              <p className="text-red-400 font-medium">This action cannot be undone and will purge the profile.</p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-[var(--hover-bg)] border border-[var(--border-line)] hover:bg-[var(--border-line)] text-xs font-semibold rounded-xl text-[var(--text-main)] transition-all uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeDeleteUser}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-semibold rounded-xl text-white shadow-lg transition-all uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <AppSpinner size="small" /> Deleting...
                  </>
                ) : (
                  <><Trash2 size={14} /> Delete Profile</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}