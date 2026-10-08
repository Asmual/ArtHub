/* eslint-disable @next/next/no-img-element */
"use client";

import NextLink from "next/link";
import { Paintbrush, Hammer, Cpu, Camera, ArrowRight, Sparkles } from "lucide-react";

export default function CategorySection() {
  const categories = [
    {
      name: "Painting",
      subtitle: "Original Paintings",
      description: "Oil, acrylic, and watercolor works crafted by featured painters.",
      icon: Paintbrush,
      image: "https://i.ibb.co.com/fzCLwkDV/art-works-1.jpg",
      tag: "Original Canvases",
    },
    {
      name: "Sculpture",
      subtitle: "Handcrafted Sculptures",
      description: "Clay, bronze, and stone spatial forms molded by studio sculptors.",
      icon: Hammer,
      image: "https://i.ibb.co.com/xKfB0070/art-works-16.jpg",
      tag: "3D Physical Forms",
    },
    {
      name: "Digital Art",
      subtitle: "Digital Innovations",
      description: "Generative, vector, and 3D concepts from contemporary creators.",
      icon: Cpu,
      image: "https://i.ibb.co.com/fYfGYCKp/art-works-13.jpg",
      tag: "Digital Masterpieces",
    },
    {
      name: "Photography",
      subtitle: "Fine Art Photography",
      description: "Monochrome, landscape, and portrait prints captured by artists.",
      icon: Camera,
      image: "https://i.ibb.co.com/dsY382MJ/art-works-6.jpg",
      tag: "Archival Prints",
    },
  ];

  return (
    <section
      className="bg-slate-50 dark:bg-[#1a2328] py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-white/10 transition-colors"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="w-[95%] sm:w-[94%] lg:w-[92%] 2xl:w-[90%] mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#df6742]/10 border border-[#df6742]/30 text-[#df6742] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-4">
            <Sparkles size={13} className="text-[#df6742]" />
            <span>CURATED MEDIUMS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">
            Browse by <span className="text-[#df6742]">Category</span>
          </h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-white/60 mt-3 leading-relaxed max-w-xl">
            Explore authentic collections created by community artists across distinct creative mediums.
          </p>
        </div>

        {/* 4-Column Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const IconComponent = cat.icon;

            return (
              <NextLink
                key={cat.name}
                href={`/browse?category=${encodeURIComponent(cat.name)}`}
                className="group relative h-96 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-2xl hover:border-[#df6742]/50 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between p-6 select-none bg-slate-900"
              >
                {/* Background Image Layer with Zoom on Hover */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  {/* Refined gradient vignette for contrast and readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20 group-hover:from-black/85 group-hover:via-black/35 transition-colors duration-500" />
                </div>

                {/* Top Floating Glass Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center group-hover:bg-[#df6742] group-hover:border-[#df6742] transition-colors duration-300 shadow-md">
                    <IconComponent size={20} />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wide text-white/90 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                    {cat.tag}
                  </span>
                </div>

                {/* Bottom Card Content */}
                <div className="relative z-10 space-y-2.5">
                  <div className="w-8 h-1 bg-[#df6742] rounded-full group-hover:w-16 transition-all duration-300" />
                  
                  <div>
                    <h3 className="text-2xl font-extrabold text-white tracking-tight group-hover:text-[#df6742] transition-colors duration-200">
                      {cat.name}
                    </h3>
                    <p className="text-xs font-semibold text-white/80 mt-0.5">
                      {cat.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-white/70 line-clamp-2 leading-relaxed font-normal">
                    {cat.description}
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-xs font-bold text-white group-hover:text-[#df6742] transition-colors">
                    <span>Browse Collection</span>
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1.5"
                    />
                  </div>
                </div>
              </NextLink>
            );
          })}
        </div>

      </div>
    </section>
  );
}