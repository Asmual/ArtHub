import React from 'react';


const Loading = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#2f3f48] z-50">
      <div className="relative flex items-center justify-center">
        
        {/* Outer spinning ring using brand colors (#df6742 and white opacity) */}
        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[#df6742] border-r-[#df6742] animate-spin absolute"></div>
        
        {/* Inner reverse spinning ring for a smooth, dynamic effect */}
        <div className="w-12 h-12 rounded-full border-2 border-transparent border-b-white border-l-white/40 animate-spin absolute" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        
        {/* Central solid core with pulse effect */}
        <div className="w-6 h-6 rounded-full bg-white shadow-lg shadow-[#df6742]/50 animate-pulse"></div>
        
      </div>

      {/* Brand branding and typography section */}
      <div className="mt-8 text-center space-y-1.5">
        {/* ArtHub title with highlighted brand color */}
        <h2 className="text-xl font-bold tracking-[0.25em] text-white uppercase pl-[0.25em]">
          Art<span className="text-[#df6742]">Hub</span>
        </h2>
        
        {/* Subtext indicating system data fetching or loading state */}
        <p className="text-xs text-slate-400 font-light tracking-widest uppercase animate-pulse">
          Loading ArtHub
        </p>
      </div>
    </div>
  );
};

export default Loading;