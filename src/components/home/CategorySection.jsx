"use client";

import NextLink from "next/link";
import { Paintbrush, Hammer, Cpu, Camera, ArrowRight } from "lucide-react";

export default function CategorySection() {
  const categories = [
    { 
      name: "Painting", 
      count: "5 Items", 
      icon: Paintbrush,
      bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
    },
    { 
      name: "Sculpture", 
      count: "3 Items", 
      icon: Hammer,
      bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" 
    },
    { 
      name: "Digital Art", 
      count: "5 Items", 
      icon: Cpu,
      bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" 
    },
    { 
      name: "Photography", 
      count: "5 Items", 
      icon: Camera,
      bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" 
    },
  ];

  return (
    <section className="bg-white dark:bg-[#2f3f48] py-16 px-4 sm:px-6 lg:px-8 border-t border-b border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Section Header - Centered */}
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Browse by <span className="text-[#df6742]">Category</span>
          </h2>
          <p className="text-md text-slate-500 dark:text-neutral-400 mt-4 max-w-md mx-auto">
            Explore our curated collections across different art forms
          </p>
        </div>

        {/* Grid Layout - Completely Centered Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <NextLink
                key={cat.name}
                href={`/browse?category=${encodeURIComponent(cat.name)}`}
                className="group bg-slate-50 dark:bg-[#1e262b] border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center text-center justify-between shadow-sm dark:shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-[#df6742]/40 hover:shadow-xl cursor-pointer"
              >
                <div className="flex flex-col items-center space-y-4 w-full">
                  {/* Modern Vector Icon Badge */}
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${cat.bg}`}>
                    <IconComponent size={24} strokeWidth={2} />
                  </div>
                  
                  {/* Category Details */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-[#df6742] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">{cat.count}</p>
                  </div>
                </div>

                {/* Centered Action Link */}
                <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#df6742]">
                  <span className="group-hover:underline">Explore Collection</span>
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </NextLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}