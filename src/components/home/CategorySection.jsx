/* eslint-disable @next/next/no-img-element */
"use client";

import NextLink from "next/link";
import { Paintbrush, Hammer, Cpu, Camera, ArrowRight } from "lucide-react";

export default function CategorySection() {
  const categories = [
    {
      name: "Painting",
      description: "Oil, Acrylic, Watercolor & Mixed Canvas",
      count: "Curated Masterpieces",
      icon: Paintbrush,
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
      accent: "from-emerald-600/80",
    },
    {
      name: "Sculpture",
      description: "Marble, Bronze, Clay & 3D Spatial Forms",
      count: "Dimensional Sculptures",
      icon: Hammer,
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      accent: "from-amber-600/80",
    },
    {
      name: "Digital Art",
      description: "Generative, Vector, 3D & Ethereal Concepts",
      count: "Digital Innovations",
      icon: Cpu,
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      accent: "from-blue-600/80",
    },
    {
      name: "Photography",
      description: "Fine Art, Monochrome, Portrait & Landscapes",
      count: "Exclusive Prints",
      icon: Camera,
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
      accent: "from-purple-600/80",
    },
  ];

  return (
    <section
      className="bg-white dark:bg-[#2a3942] py-20 px-4 sm:px-6 lg:px-8 border-t border-b border-slate-200 dark:border-white/10 transition-colors"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="w-[95%] sm:w-[94%] lg:w-[92%] 2xl:w-[90%] mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-[#243239]/10 border border-[#df6742]/30 text-[#df6742] px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#df6742]" />
            CURATED MEDIUMS
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">
            Browse by <span className="text-[#df6742]">Category</span>
          </h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-white/50 mt-4 leading-relaxed">
            Discover rare original artworks filtered by creative mediums and artistic expressions.
          </p>
        </div>

        {/* 4-Column Image-Backed Category Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const IconComponent = cat.icon;

            return (
              <NextLink
                key={cat.name}
                href={`/browse?category=${encodeURIComponent(cat.name)}`}
                className="group relative h-88 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col justify-between p-6 select-none"
              >
                {/* Background Image Layer with Zoom on Hover */}
                <div className="absolute inset-0 z-0 overflow-hidden bg-slate-900">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-700 ease-out"
                  />
                  {/* Multi-tier Dark Gradient Vignette for perfect text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/25 group-hover:from-black/90 group-hover:via-black/40 transition-colors duration-500" />
                </div>

                {/* Top Floating Glassmorphic Icon Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white flex items-center justify-center group-hover:bg-[#df6742] group-hover:border-[#df6742] transition-colors duration-300 shadow-md">
                    <IconComponent size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                    {cat.count}
                  </span>
                </div>

                {/* Bottom Typography & Action Callout */}
                <div className="relative z-10 space-y-2">
                  <div className="w-8 h-1 bg-[#df6742] rounded-full group-hover:w-14 transition-all duration-300" />
                  
                  <h3 className="text-2xl font-extrabold text-white tracking-wide group-hover:text-[#df6742] transition-colors duration-200">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-white/70 font-medium line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-xs font-bold text-white group-hover:text-[#df6742] transition-colors">
                    <span>Explore Collection</span>
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