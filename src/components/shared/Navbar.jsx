/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useRef, useEffect } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import toast from "react-hot-toast";
import ThemeToggle from "@/components/shared/ThemeToggle";
import {
  ChevronDown, Search, LayoutDashboard, ShoppingBag, ImageIcon,
  User, Palette, PlusSquare, TrendingUp, Users, Shield, CreditCard,
  BarChart2, LogOut, X, Menu, Eye,
} from "lucide-react";

/* ============================================================
   ROLE-BASED DASHBOARD NAVIGATION HELPERS
============================================================ */
const getMainDashboardPath = (role) => {
  if (role === "admin") return "/dashboard/admin";
  if (role === "artist") return "/dashboard/artist";
  return "/dashboard/user";
};

const getDashboardLinks = (role) => {
  const mainPath = getMainDashboardPath(role);
  const common = [{ href: mainPath, label: "View Dashboard", icon: Eye }];

  if (role === "buyer" || role === "user") {
    return [
      ...common,
      { href: "/dashboard/user/purchase-history", label: "Purchase History",   icon: ShoppingBag },
      { href: "/dashboard/user/bought-artworks",  label: "Bought Artworks",    icon: ImageIcon },
      { href: "/dashboard/user/profile",           label: "Profile Management", icon: User },
    ];
  }
  if (role === "artist") {
    return [
      ...common,
      { href: "/dashboard/artist/manage-artworks", label: "Manage Artworks",    icon: Palette },
      { href: "/dashboard/artist/add-art",          label: "Add Artwork",         icon: PlusSquare },
      { href: "/dashboard/artist/sales",            label: "Sales History",       icon: TrendingUp },
      { href: "/dashboard/artist/profile",          label: "Profile Management",  icon: User },
    ];
  }
  if (role === "admin") {
    return [
      ...common,
      { href: "/dashboard/admin/users",        label: "Manage Users",          icon: Users },
      { href: "/dashboard/admin/artworks",     label: "Manage All Artworks",   icon: Shield },
      { href: "/dashboard/admin/transactions", label: "View All Transactions", icon: CreditCard },
      { href: "/dashboard/admin/charts",       label: "Charts & Analytics",    icon: BarChart2 },
      { href: "/dashboard/admin/profile",      label: "Profile Management",    icon: User },
    ];
  }
  return [];
};

const getRoleBadgeColor = (role) => {
  if (role === "admin")  return "bg-purple-600 border border-purple-400/30";
  if (role === "artist") return "bg-amber-600  border border-amber-400/30";
  return "bg-[var(--brand)] border border-orange-400/30";
};

const isValidImageUrl = (url) =>
  Boolean(url) && url !== "null" && url !== "undefined" && url.trim() !== "";

/* ============================================================
   STABLE PRESENTATIONAL COMPONENTS
   Defined outside Navbar so identity stays stable across renders.
============================================================ */
const NavLink = ({ href, children, active }) => (
  <NextLink
    href={href}
    className={`text-sm font-semibold tracking-wide transition-colors duration-200 relative py-1 whitespace-nowrap ${
      active ? "text-[var(--brand)]" : "text-foreground/90 hover:text-[var(--brand)]"
    }`}
  >
    {children}
    {active && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--brand)] rounded-full" />}
  </NextLink>
);

const UserInitials = ({ name, size = "w-10 h-10", textSize = "text-lg" }) => (
  <div className={`bg-[var(--brand)] text-white rounded-full ${size} border-2 border-[var(--brand)] flex items-center justify-center shrink-0`}>
    <span className={`${textSize} font-bold uppercase leading-none`}>
      {name ? name.charAt(0) : "U"}
    </span>
  </div>
);

const AvatarImage = ({ user, hasValidImage, onImageError, size = "w-8 h-8", ringClass = "ring-2 ring-[var(--brand)]/40" }) =>
  hasValidImage ? (
    <div className={`${size} rounded-full overflow-hidden ${ringClass} shrink-0`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={user.image}
        alt={user?.name || "User avatar"}
        referrerPolicy="no-referrer"
        onError={onImageError}
        className="w-full h-full object-cover"
      />
    </div>
  ) : (
    <UserInitials name={user?.name} size={size} />
  );

const SearchSuggestions = ({ isSearching, searchResults, onClose }) => (
  <div className="absolute top-full left-0 w-full mt-2 bg-surface border border-border-line rounded-2xl shadow-2xl overflow-hidden z-50 py-2">
    {isSearching ? (
      <div className="p-4 flex items-center gap-2 text-sm text-foreground/50">
        <div className="w-4 h-4 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
        Searching artworks...
      </div>
    ) : searchResults.length > 0 ? (
      <>
        <p className="px-4 py-1.5 text-[11px] uppercase tracking-wider text-foreground/40 font-bold border-b border-border-line">
          Matching Artworks
        </p>
        {searchResults.map((art) => (
          <NextLink
            key={art._id || art.id}
            href={`/artworks/${art._id || art.id}`}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--hover-bg)] transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-[var(--hover-bg)] shrink-0 border border-border-line">
              {art.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate group-hover:text-[var(--brand)] transition-colors">
                {art.title}
              </p>
              <p className="text-xs text-foreground/50 truncate">
                by {art.artistName || art.artist?.name || "Unknown"}
              </p>
            </div>
            <span className="text-sm font-bold text-(--brand) shrink-0">${art.price}</span>
          </NextLink>
        ))}
      </>
    ) : (
      <p className="p-4 text-sm text-foreground/40 text-center">No artworks found</p>
    )}
  </div>
);

const AvatarDropdown = ({ user, hasValidImage, onImageError, onNavigateProfile, onLogout }) => (
  <div className="absolute right-0 top-full mt-2.5 w-72 bg-surface border border-border-line rounded-2xl shadow-2xl z-50 overflow-hidden">
    <div className="p-4 bg-(--surface-elevated) border-b border-border-line">
      <div className="flex items-center gap-3.5 mb-3">
        <button onClick={onNavigateProfile} className="cursor-pointer focus:outline-none shrink-0">
          <AvatarImage
            user={user}
            hasValidImage={hasValidImage}
            onImageError={onImageError}
            size="w-10 h-10"
            ringClass="ring-2 ring-[var(--brand)]/50"
          />
        </button>
        <div className="min-w-0">
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${getRoleBadgeColor(user.role)}`}>
            {user.role}
          </span>
          <p className="text-[11px] uppercase tracking-wider text-foreground/40 font-bold mt-0.5">Account Holder</p>
        </div>
      </div>
      <div className="space-y-1.5 bg-[var(--hover-bg)] p-2.5 rounded-xl border border-border-line">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-foreground/40 font-semibold shrink-0">Name:</span>
          <p className="text-sm font-bold text-foreground truncate">{user.name || "N/A"}</p>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-foreground/40 font-semibold shrink-0">Email:</span>
          <p className="text-xs font-medium text-foreground/80 select-all truncate">{user.email || "N/A"}</p>
        </div>
      </div>
    </div>
    <div className="p-2 bg-surface">
      <button
        onClick={onLogout}
        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors group"
      >
        <LogOut size={15} className="group-hover:translate-x-0.5 transition-transform" />
        Logout
      </button>
    </div>
  </div>
);

/* ============================================================
   NAVBAR COMPONENT
============================================================ */
const Navbar = () => {
  const pathname = usePathname();
  const router   = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [isMobileMenuOpen,      setIsMobileMenuOpen]      = useState(false);
  const [isMobileDashboardOpen, setIsMobileDashboardOpen] = useState(false);
  const [isDashboardOpen,       setIsDashboardOpen]       = useState(false);
  const [isAvatarOpen,          setIsAvatarOpen]          = useState(false);
  const [imageError,            setImageError]            = useState(false);
  const [isMobileSearchOpen,    setIsMobileSearchOpen]    = useState(false);

  const [searchQuery,   setSearchQuery]   = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults,  setSearchResults]  = useState([]);
  const [isSearching,    setIsSearching]    = useState(false);

  const dashboardRef     = useRef(null);
  const avatarRef        = useRef(null);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef  = useRef(null);

  useEffect(() => { setImageError(false); }, [user]);

  /* ---- Close dropdowns on outside click ---- */
  useEffect(() => {
    const handle = (e) => {
      if (dashboardRef.current     && !dashboardRef.current.contains(e.target))     setIsDashboardOpen(false);
      if (avatarRef.current        && !avatarRef.current.contains(e.target))        setIsAvatarOpen(false);
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target)) setIsSearchFocused(false);
      if (mobileSearchRef.current  && !mobileSearchRef.current.contains(e.target))  setIsMobileSearchOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  /* ---- Debounced live search ---- */
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) { setSearchResults([]); return; }
      setIsSearching(true);
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
        const res  = await fetch(`${base}/api/artworks/search?query=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data       = await res.json();
          const normalized = Array.isArray(data) ? data : (data.artworks || []);
          setSearchResults(normalized.slice(0, 5));
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Live search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    const timerId = setTimeout(fetchResults, 300);
    return () => clearTimeout(timerId);
  }, [searchQuery]);

  const handleLogout = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            setIsMobileMenuOpen(false);
            setIsAvatarOpen(false);
            toast.success("Logged out successfully!");
            router.push("/login");
          },
        },
      });
    } catch {
      toast.error("Failed to log out. Please try again.");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    setIsMobileMenuOpen(false);
  };

  const navigateToProfile = () => {
    if (!user) return;
    const role = user.role === "buyer" ? "user" : user.role;
    router.push(`/dashboard/${role}/profile`);
    setIsAvatarOpen(false);
    setIsMobileMenuOpen(false);
  };

  const closeDesktopSearch = () => { setIsSearchFocused(false); setSearchQuery(""); };
  const closeMobileSearch  = () => { setIsMobileSearchOpen(false); setSearchQuery(""); };

  const isActive       = (path) => pathname === path;
  const dashboardLinks = user ? getDashboardLinks(user.role) : [];
  const hasValidImage  = isValidImageUrl(user?.image) && !imageError;
  const handleImageError = () => setImageError(true);

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <nav
      className="bg-background text-foreground shadow-lg sticky top-0 z-50 h-16 flex items-center border-b border-border-line"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center h-16 gap-4">

          {/* ── BRAND LOGO ── */}
          <NextLink href="/" className="flex items-center gap-2.5 group shrink-0">
            <Image
              src="/Images/ArtHubLogo.png"
              alt="ArtHub Logo"
              width={36}
              height={36}
              className="object-contain rounded-full border-2 border-[var(--brand)] group-hover:scale-105 transition-transform"
            />
            <span className="text-xl font-bold tracking-tight text-foreground">
              Art<span className="text-[var(--brand)]">Hub</span>
            </span>
          </NextLink>

          {/* ── DESKTOP SEARCH BAR ── */}
          <div ref={desktopSearchRef} className="hidden md:block flex-1 mx-6 max-w-md relative">
            <form onSubmit={handleSearchSubmit}>
              <div className={`flex items-center w-full border rounded-full px-3.5 py-1.5 gap-2 transition-all duration-200 ${
                isSearchFocused
                  ? "border-[var(--brand)]/60 bg-[var(--hover-bg)]"
                  : "border-border-line bg-[var(--hover-bg)]/60 hover:border-[var(--border-strong)]"
              }`}>
                <Search size={15} className={`shrink-0 ${isSearchFocused ? "text-[var(--brand)]" : "text-foreground/40"}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search artworks by title or artist..."
                  className="bg-transparent text-foreground text-sm placeholder-foreground/35 outline-none w-full"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery("")} className="text-foreground/40 hover:text-foreground/70 shrink-0">
                    <X size={13} />
                  </button>
                )}
              </div>
            </form>
            {isSearchFocused && searchQuery.trim() && (
              <SearchSuggestions
                isSearching={isSearching}
                searchResults={searchResults}
                onClose={closeDesktopSearch}
              />
            )}
          </div>

          {/* ── DESKTOP NAV LINKS ── */}
          <div className="hidden md:flex items-center gap-6 shrink-0">
            <NavLink href="/"       active={isActive("/")}>Home</NavLink>
            <NavLink href="/browse" active={isActive("/browse")}>Browse Artworks</NavLink>

            {user && (
              <div ref={dashboardRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsDashboardOpen((p) => !p)}
                  className={`text-sm font-semibold tracking-wide transition-colors duration-200 py-1 flex items-center gap-1 cursor-pointer ${
                    pathname.startsWith("/dashboard") ? "text-[var(--brand)]" : "text-foreground/90 hover:text-[var(--brand)]"
                  }`}
                >
                  <LayoutDashboard size={15} className="mr-0.5" />
                  Dashboard
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isDashboardOpen ? "rotate-180" : ""}`} />
                </button>

                {isDashboardOpen && (
                  <ul className="absolute top-full left-0 mt-2.5 w-56 bg-surface border border-border-line rounded-2xl shadow-2xl overflow-hidden z-50 py-1.5">
                    {dashboardLinks.map(({ href, label, icon: Icon }, index) => (
                      <li key={href}>
                        <NextLink
                          href={href}
                          onClick={() => setIsDashboardOpen(false)}
                          className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                            index === 0
                              ? "text-foreground/80 hover:text-[var(--brand)] font-semibold border-b border-border-line pb-3 mb-1.5 hover:bg-[var(--hover-bg)]"
                              : isActive(href)
                              ? "text-[var(--brand)] bg-[var(--hover-bg)]"
                              : "text-foreground/80 hover:text-[var(--brand)] hover:bg-[var(--hover-bg)]"
                          }`}
                        >
                          <Icon size={15} className="shrink-0 opacity-70" />
                          {label}
                        </NextLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* ── DESKTOP AUTH / UTILITIES SECTION ── */}
          <div className="hidden md:flex items-center ml-auto gap-4 shrink-0">
            <ThemeToggle />

            {isPending ? (
              <div className="w-9 h-9 rounded-full border-2 border-border-line animate-pulse bg-[var(--hover-bg)]" />
            ) : user ? (
              <div ref={avatarRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsAvatarOpen((p) => !p)}
                  className="cursor-pointer hover:scale-105 transition-transform focus:outline-none"
                >
                  <AvatarImage user={user} hasValidImage={hasValidImage} onImageError={handleImageError} />
                </button>
                {isAvatarOpen && (
                  <AvatarDropdown
                    user={user}
                    hasValidImage={hasValidImage}
                    onImageError={handleImageError}
                    onNavigateProfile={navigateToProfile}
                    onLogout={handleLogout}
                  />
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <NextLink
                  href="/login"
                  className="text-foreground hover:text-[var(--brand)] text-sm font-bold transition-colors px-3 py-2 border border-[var(--border-strong)] rounded-xl hover:bg-[var(--hover-bg)]"
                >
                  Login
                </NextLink>
                <NextLink
                  href="/register"
                  className="bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white px-5 py-2 rounded-full text-sm font-bold shadow-md transition-all"
                >
                  Sign Up
                </NextLink>
              </div>
            )}
          </div>

          {/* ── MOBILE CONTROLS (Theme Toggle, Search, + Hamburger) ── */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen((p) => !p)}
              aria-label="Toggle search"
              className={`p-2 rounded-xl border transition-colors ${
                isMobileSearchOpen
                  ? "text-[var(--brand)] bg-[var(--brand)]/10 border-(--brand)/30"
                  : "text-foreground/80 bg-[var(--hover-bg)] border-border-line hover:bg-[var(--hover-bg)]"
              }`}
            >
              <Search size={18} />
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((p) => !p)}
              aria-label="Toggle menu"
              className="p-2 rounded-xl bg-[var(--hover-bg)] border border-border-line text-foreground hover:text-[var(--brand)] transition-colors"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>
      </div>

      {/* ── MOBILE SEARCH PANEL ── */}
      {isMobileSearchOpen && (
        <div
          ref={mobileSearchRef}
          className="absolute top-16 left-0 w-full md:hidden bg-surface border-t border-border-line shadow-xl z-50 px-4 py-3"
        >
          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center border border-border-line bg-[var(--hover-bg)] rounded-full px-4 py-2 gap-2 focus-within:border-[var(--brand)]/50 transition-colors">
              <Search size={15} className="text-foreground/40 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artworks or artist..."
                autoFocus
                className="bg-transparent text-foreground text-sm placeholder-foreground/35 outline-none w-full"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="text-foreground/40 hover:text-foreground/70 shrink-0">
                  <X size={13} />
                </button>
              )}
            </div>
          </form>
          {searchQuery.trim() && (
            <div className="relative">
              <SearchSuggestions
                isSearching={isSearching}
                searchResults={searchResults}
                onClose={closeMobileSearch}
              />
            </div>
          )}
        </div>
      )}

      {/* ── MOBILE DRAWER MENU ── */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full md:hidden bg-surface border-t border-border-line shadow-xl z-50 max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="flex flex-col items-center gap-2 px-6 pt-5 pb-6">

            <NextLink
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full max-w-sm text-center py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${
                isActive("/") ? "bg-[var(--brand)] text-white shadow-md" : "text-foreground/80 hover:bg-[var(--hover-bg)]"
              }`}
            >
              Home
            </NextLink>

            <NextLink
              href="/browse"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full max-w-sm text-center py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${
                isActive("/browse") ? "bg-[var(--brand)] text-white shadow-md" : "text-foreground/80 hover:bg-[var(--hover-bg)]"
              }`}
            >
              Browse Artworks
            </NextLink>

            {/* Mobile dashboard accordion */}
            {user && (
              <div className="w-full max-w-sm">
                <button
                  type="button"
                  onClick={() => setIsMobileDashboardOpen((p) => !p)}
                  className={`w-full flex justify-center items-center gap-2 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${
                    pathname.startsWith("/dashboard")
                      ? "text-[var(--brand)] bg-[var(--hover-bg)]"
                      : "text-foreground/80 hover:bg-[var(--hover-bg)]"
                  }`}
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isMobileDashboardOpen ? "rotate-180" : ""}`} />
                </button>

                {isMobileDashboardOpen && (
                  <div className="mt-2 bg-[var(--surface-elevated)] rounded-xl overflow-hidden border border-border-line flex flex-col items-center w-full">
                    {dashboardLinks.map(({ href, label, icon: Icon }, index) => (
                      <NextLink
                        key={href}
                        href={href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`w-full py-3 text-sm transition-colors flex items-center justify-center gap-2 ${
                          index === 0
                            ? "text-[var(--brand)] font-black border-b border-border-line bg-[var(--hover-bg)]"
                            : isActive(href)
                            ? "text-[var(--brand)] font-bold bg-[var(--hover-bg)]"
                            : "text-foreground/70 hover:bg-[var(--hover-bg)]"
                        }`}
                      >
                        <Icon size={14} className="opacity-70 shrink-0" />
                        {label}
                      </NextLink>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mobile auth / user card */}
            <div className="pt-4 border-t border-border-line mt-2 w-full max-w-sm">
              {isPending ? (
                <div className="h-20 bg-[var(--hover-bg)] animate-pulse rounded-2xl w-full" />
              ) : user ? (
                <div className="bg-[var(--surface-elevated)] rounded-2xl p-4 border border-border-line flex flex-col items-center gap-3.5 w-full">
                  <div className="flex flex-col items-center text-center gap-2">
                    <button type="button" onClick={navigateToProfile} className="cursor-pointer focus:outline-none">
                      <AvatarImage
                        user={user}
                        hasValidImage={hasValidImage}
                        onImageError={handleImageError}
                        size="w-10 h-10"
                        ringClass="ring-2 ring-[var(--brand)]/50"
                      />
                    </button>
                    <div className="flex flex-col items-center mt-1">
                      <span className={`inline-block text-[9px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded-full mb-2 ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                      <div className="text-[13px] text-foreground/90 font-bold max-w-60 truncate">{user.name}</div>
                      <div className="text-[11px] text-foreground/50 max-w-60 truncate select-all mt-0.5">{user.email}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] transition-colors shadow-md"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 w-full">
                  <NextLink
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center text-foreground border border-[var(--border-strong)] hover:bg-[var(--hover-bg)] py-3 rounded-xl text-sm font-bold transition-all"
                  >
                    Login
                  </NextLink>
                  <NextLink
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white py-3 rounded-xl text-sm font-bold shadow-md transition-all"
                  >
                    Sign Up
                  </NextLink>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;