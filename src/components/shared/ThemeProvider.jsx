// /* eslint-disable react-hooks/set-state-in-effect */
// "use client";

// import React, { useEffect, useState } from "react";
// import { ThemeProvider as NextThemeProvider } from "next-themes";

// export function ThemeProvider({ children }) {
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) {
//     return <div style={{ visibility: "hidden" }}>{children}</div>;
//   }

//   return (
//     <NextThemeProvider 
//       attribute="data-theme" 
//       defaultTheme="dark" 
//       enableSystem={false}
//       disableTransitionOnChange
//     >
//       {children}
//     </NextThemeProvider>
//   );
// }
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";

export function ThemeProvider({ children }) {
  return (
    <NextThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}