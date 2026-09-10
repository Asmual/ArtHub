/* eslint-disable react-hooks/static-components */
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  LayoutDashboard,
  ShoppingBag,
  ImageIcon,
  User,
  Palette,
  PlusSquare,
  TrendingUp,
  Users,
  Shield,
  CreditCard,
  BarChart2,
  Crown,
} from "lucide-react";


export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const role = user?.role || "user";

  const isActive = (path) => pathname === path;

  // Reusable navigation link element
  const SidebarLink = ({ href, label, icon: Icon }) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${
        isActive(href)
          ? "bg-[#df6742] text-white shadow-md"
          : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-bg)]"
      }`}
    >
      <Icon size={18} className="shrink-0" />
      <span>{label}</span>
    </Link>
  );

  return (
    <aside className="w-64 bg-[var(--surface)] border-r border-[var(--border-line)] min-h-screen p-4 flex-col gap-6 shrink-0 hidden md:flex">
      {/* Identity Profile Section */}
      <div className="px-4 py-2 border-b border-[var(--border-line)]">
        <h2 className="text-lg font-bold text-[var(--text-main)] tracking-tight">
          Control Panel
        </h2>
        <p className="text-xs text-[var(--text-muted)] capitalize font-medium mt-0.5">
          Role: {role}
        </p>
      </div>

      {/* Dynamic Role-Based Navigation Architecture */}
      <div className="flex flex-col gap-5 flex-1 overflow-y-auto pr-1">
        
        {/* Buyer View Control (Strictly hidden from Admin role) */}
        {(role === "user" || role === "buyer") && (
          <div className="flex flex-col gap-1.5">
            <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">Buyer Dashboard</p>
            <SidebarLink href="/dashboard/user" label="Overview" icon={LayoutDashboard} />
            <SidebarLink href="/dashboard/user/purchase-history" label="Purchase History" icon={ShoppingBag} />
            <SidebarLink href="/dashboard/user/bought-artworks" label="Bought Artworks" icon={ImageIcon} />
            <SidebarLink href="/dashboard/user/profile" label="Profile Management" icon={User} />
          </div>
        )}

        {/* Artist View Control (Strictly hidden from Admin role) */}
        {role === "artist" && (
          <div className="flex flex-col gap-1.5">
            <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">Artist Dashboard</p>
            <SidebarLink href="/dashboard/artist" label="Overview" icon={LayoutDashboard} />
            <SidebarLink href="/dashboard/artist/manage-artworks" label="Manage Artworks" icon={Palette} />
            <SidebarLink href="/dashboard/artist/add-art" label="Add Artwork" icon={PlusSquare} />
            <SidebarLink href="/dashboard/artist/sales" label="Sales History" icon={TrendingUp} />
            <SidebarLink href="/dashboard/artist/profile" label="Profile Management" icon={User} />
          </div>
        )}

        {/* Admin Comprehensive Isolation Section */}
        {role === "admin" && (
          <div className="flex flex-col gap-1.5">
            <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">Admin Dashboard</p>
            <SidebarLink href="/dashboard/admin" label="Overview" icon={LayoutDashboard} />
            
            <SidebarLink href="/dashboard/admin/users" label="Manage Users" icon={Users} />
            <SidebarLink href="/dashboard/admin/subscriptions" label="Artist Subscriptions" icon={Crown} />
            {/* Updated label to Manage All Artworks */}
            <SidebarLink href="/dashboard/admin/artworks" label="Manage All Artworks" icon={Shield} />

            {/* Updated label to All Transactions */}
            <SidebarLink href="/dashboard/admin/transactions" label="All Transactions" icon={CreditCard} />
            <SidebarLink href="/dashboard/admin/analytics" label="Analytics Overview" icon={TrendingUp} />
            {/* Added Charts right after Overview based on assignment requirements */}
            <SidebarLink href="/dashboard/admin/charts" label="Charts" icon={BarChart2} />
            {/* Updated label to Profile Management */}
            <SidebarLink href="/dashboard/admin/profile" label="Profile Management" icon={User} />
          </div>
        )}

      </div>
    </aside>
  );
}