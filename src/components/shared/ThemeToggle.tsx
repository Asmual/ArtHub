// /* eslint-disable react-hooks/set-state-in-effect */
// "use client";

// import React, { useEffect, useState } from "react";
// import { useTheme } from "next-themes";
// import { Sun, Moon } from "lucide-react";

// export default function ThemeToggle() {
//   const { resolvedTheme, setTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) {
//     return <div className="w-9 h-9 rounded-xl bg-transparent shrink-0" />;
//   }

//   const isDark = resolvedTheme === "dark";

//   return (
//     <button
//       type="button"
//       onClick={() => setTheme(isDark ? "light" : "dark")}
//       aria-label="Toggle theme"
//       className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-700 dark:text-amber-400 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
//     >
//       {isDark ? <Sun size={18} /> : <Moon size={18} />}
//     </button>
//   );
// }
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl bg-transparent shrink-0" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-700 dark:text-amber-400 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}