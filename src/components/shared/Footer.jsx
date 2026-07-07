"use client";

import React from "react";
import NextLink from "next/link";
import Image from "next/image";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-white/85 dark:bg-[#243239]/85 text-slate-700 dark:text-white/90 border-t border-slate-200 dark:border-white/10"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Main Footer Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand Info & Socials */}
          <div className="space-y-4">
            <NextLink href="/" className="flex items-center gap-3 group">
              <Image
                src="/Images/ArtHubLogo.png"
                alt="ArtHub Logo"
                width={36}
                height={36}
                className="object-contain border-2 border-[#df6742] dark:border-[#df6742] rounded-full shadow-md"
              />
              <span className="text-xl font-black tracking-tight text-slate-700 dark:text-white">
                Art<span className="text-[#df6742]">Hub</span>
              </span>
            </NextLink>
            <p className="text-sm text-slate-600 dark:text-white/70 leading-relaxed">
              A curated digital marketplace and community for art lovers,
              creators, and collectors to share and buy beautiful masterpieces
              worldwide.
            </p>

            {/* Clickable Social Links opening in a new tab */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 dark:text-white/60 hover:text-[#df6742] transition-colors p-1"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-5 h-5" />
              </a>
              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 dark:text-white/60 hover:text-[#df6742] transition-colors p-1"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 dark:text-white/60 hover:text-[#df6742] transition-colors p-1"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Navigation Links */}
          <div className="space-y-4 md:pl-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#df6742]">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <NextLink
                  href="/"
                  className="text-slate-600 dark:text-white/70 hover:text-[#df6742] dark:hover:text-white transition-colors"
                >
                  Home
                </NextLink>
              </li>
              <li>
                <NextLink
                  href="/browse"
                  className="text-slate-600 dark:text-white/70 hover:text-[#df6742] dark:hover:text-white transition-colors"
                >
                  Browse Artworks
                </NextLink>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Support Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#df6742]">
              Support & Legal
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <NextLink
                  href="/contact"
                  className="text-slate-600 dark:text-white/70 hover:text-[#df6742] dark:hover:text-white transition-colors"
                >
                  Contact Support
                </NextLink>
              </li>
              <li>
                <NextLink
                  href="/privacy"
                  className="text-slate-600 dark:text-white/70 hover:text-[#df6742] dark:hover:text-white transition-colors"
                >
                  Privacy Policy
                </NextLink>
              </li>
              <li>
                <NextLink
                  href="/terms"
                  className="text-slate-600 dark:text-white/70 hover:text-[#df6742] dark:hover:text-white transition-colors"
                >
                  Terms of Service
                </NextLink>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter Subscription */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#df6742]">
              Stay Updated
            </h3>
            <p className="text-sm text-slate-600 dark:text-white/70 leading-relaxed">
              Subscribe to get notified about special collections, art auctions,
              and top artist features.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-2 pt-1"
            >
              <input
                type="email"
                placeholder="Enter email"
                className="w-full px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:border-[#df6742] transition-colors"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#df6742] hover:bg-[#c55332] text-white text-sm font-bold rounded-xl transition-all active:scale-95 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar Segment */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-white/70 font-medium">
          <p>© {currentYear} ArtHub Gallery. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Designed with passion for artists worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;