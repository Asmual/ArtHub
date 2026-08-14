/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import NextLink from "next/link";
import Artcard from "@/components/artwork/Artcard";

export default function BrowseArtworksClient({ initialArtworks = [] }) {
  const searchParams = useSearchParams();
  
  // Get initial category from URL query (?category=...) or default to "All"
  const urlCategory = searchParams.get("category") || "All";

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [appliedMinPrice, setAppliedMinPrice] = useState("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState("");
  const [availability, setAvailability] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Sync state if URL category changes dynamically
  useEffect(() => {
    if (searchParams.get("category")) {
      setSelectedCategory(searchParams.get("category"));
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Debounce search query to optimize performance
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleReset = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
    setAvailability("All");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const handleApplyPrice = (e) => {
    e.preventDefault();
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    setCurrentPage(1);
  };

  // Filter & Sort Pipeline
  const filteredArtworks = useMemo(() => {
    let result = [...initialArtworks];

    if (debouncedSearch.trim() !== "") {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (art) =>
          art.title?.toLowerCase().includes(query) ||
          art.artistName?.toLowerCase().includes(query),
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((art) => art.category === selectedCategory);
    }

    if (availability === "Available") {
      result = result.filter((art) => !art.isSold);
    } else if (availability === "Sold Out") {
      result = result.filter((art) => art.isSold);
    }

    if (appliedMinPrice !== "") {
      result = result.filter((art) => art.price >= parseFloat(appliedMinPrice));
    }
    if (appliedMaxPrice !== "") {
      result = result.filter((art) => art.price <= parseFloat(appliedMaxPrice));
    }

    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return result;
  }, [
    initialArtworks,
    debouncedSearch,
    selectedCategory,
    availability,
    appliedMinPrice,
    appliedMaxPrice,
    sortBy,
  ]);

  const totalPages = Math.ceil(filteredArtworks.length / itemsPerPage);

  const displayedArtworks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredArtworks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredArtworks, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#2f3f48] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-neutral-500/40 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              <span className="text-[#df6742]">Explore</span> Artworks
            </h1>
          </div>

          <NextLink
            href="/"
            className="inline-flex items-center gap-2 bg-slate-100 dark:bg-[#1e262b] hover:bg-slate-200 dark:hover:bg-black/20 text-slate-700 dark:text-white/90 hover:text-slate-900 dark:hover:text-white text-xs font-bold px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 transition-all duration-200 shadow-sm"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </NextLink>
        </div>

        {/* Core Layout Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Panel: Filters Sidebar */}
          <div className="bg-slate-50 dark:bg-[#2f3f48] border border-slate-200 dark:border-neutral-500/40 rounded-2xl p-6 h-fit space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-neutral-500/40 pb-3">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Filters
              </h2>
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500 transition-all"
              >
                Reset
              </button>
            </div>

            {/* Search Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-neutral-300 uppercase tracking-wide mb-2">
                Search Title / Artist
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type to search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-400 bg-transparent border border-slate-300 dark:border-neutral-500/40 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:border-[#df6742]"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-slate-400 dark:text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Category Select Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-neutral-300 uppercase tracking-wide mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-sm text-slate-800 dark:text-white bg-white dark:bg-[#2f3f48] border border-slate-300 dark:border-neutral-500/40 rounded-lg px-3 py-2 focus:outline-none focus:border-[#df6742] cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Painting">Painting</option>
                <option value="Sculpture">Sculpture</option>
                <option value="Digital Art">Digital Art</option>
                <option value="Photography">Photography</option>
              </select>
            </div>

            {/* Availability Radio Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-neutral-300 uppercase tracking-wide mb-2">
                Availability
              </label>
              <div className="flex flex-col gap-2.5">
                {["All Items", "Available", "Sold Out"].map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-white/90 cursor-pointer font-medium"
                  >
                    <input
                      type="radio"
                      name="availability"
                      checked={
                        availability ===
                        (status === "All Items" ? "All" : status)
                      }
                      onChange={() => {
                        setAvailability(
                          status === "All Items" ? "All" : status,
                        );
                        setCurrentPage(1);
                      }}
                      className="accent-[#df6742] h-4 w-4"
                    />
                    {status}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter Form */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-neutral-300 uppercase tracking-wide mb-2">
                Price Range
              </label>
              <form onSubmit={handleApplyPrice} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-400 bg-transparent border border-slate-300 dark:border-neutral-500/40 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#df6742]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-400 bg-transparent border border-slate-300 dark:border-neutral-500/40 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#df6742]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#df6742] hover:bg-[#c55332] text-white font-semibold text-xs py-2 rounded-lg transition-all"
                >
                  Apply Price
                </button>
              </form>
            </div>
          </div>

          {/* Right Panel: Content Results */}
          <div className="col-span-1 lg:col-span-3 space-y-6">
            <div className="bg-transparent border border-slate-200 dark:border-neutral-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className="text-sm font-medium text-slate-700 dark:text-white/90">
                Showing {filteredArtworks.length} of {initialArtworks.length}{" "}
                Artworks
              </span>

              {/* Sorting Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-neutral-300 uppercase tracking-wider">
                  Sort By:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs font-semibold text-slate-800 dark:text-white bg-white dark:bg-[#2f3f48] border border-slate-300 dark:border-neutral-500/40 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#df6742] cursor-pointer"
                >
                  <option value="newest">Newest Listed</option>
                  <option value="oldest">Oldest Listed</option>
                </select>
              </div>
            </div>

            {/* Artworks Dynamic Responsive Grid */}
            {displayedArtworks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedArtworks.map((artwork) => (
                  <Artcard key={artwork._id.toString()} artwork={artwork} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-neutral-500/30 rounded-2xl p-12 text-center bg-slate-50 dark:bg-black/5">
                <p className="text-base text-slate-500 dark:text-neutral-300 font-medium">
                  No artworks match your criteria.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-3 text-sm font-bold text-[#df6742] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-8 border-t border-slate-200 dark:border-neutral-500/20">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-[#1e262b] border border-slate-200 dark:border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-black/20 text-slate-700 dark:text-white transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        currentPage === pageNumber
                          ? "bg-[#df6742] text-white"
                          : "bg-slate-100 dark:bg-[#1e262b] text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-black/20"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-[#1e262b] border border-slate-200 dark:border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-black/20 text-slate-700 dark:text-white transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}