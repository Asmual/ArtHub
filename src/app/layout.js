import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import WishlistDrawer from "@/components/cart/WishlistDrawer";
import SmoothScrollProvider from "@/components/shared/SmoothScrollProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ArtHub",
  description: "Discover & Buy Original Art",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body 
        suppressHydrationWarning 
        className="min-h-full flex flex-col bg-background text-foreground"
      >
        <ThemeProvider>
          <CartProvider>
            <SmoothScrollProvider>
              <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                  duration: 3000,
                  style: {
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "14px",
                  },
                }}
              />

              {children}
              <CartDrawer />
              <WishlistDrawer />
            </SmoothScrollProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}