/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import toast from "react-hot-toast";
import { CartItem, Artwork } from "@/types";

export interface CartContextType {
  cartItems: CartItem[];
  wishlistItems: CartItem[];
  addToCart: (artwork: Partial<Artwork> | any) => void;
  removeFromCart: (artworkId: string) => void;
  removePurchasedItem: (artworkId: string) => void;
  clearCart: () => void;
  isInCart: (artworkId: string) => boolean;
  cartCount: number;
  cartTotal: number;
  toggleWishlist: (artwork: Partial<Artwork> | any) => void;
  isInWishlist: (artworkId: string) => boolean;
  wishlistCount: number;
  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isWishlistOpen: boolean;
  setIsWishlistOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Hydrate cart and wishlist from localStorage on client mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("arthub_cart");
      const savedWishlist = localStorage.getItem("arthub_wishlist");
      if (savedCart) setCartItems(JSON.parse(savedCart));
      if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist));
    } catch (err) {
      console.error("[STORAGE ERROR] Failed to load cart or wishlist:", err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Synchronize cart changes to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("arthub_cart", JSON.stringify(cartItems));
    } catch (err) {
      console.error("[STORAGE ERROR] Failed to save cart:", err);
    }
  }, [cartItems, isHydrated]);

  // Synchronize wishlist changes to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("arthub_wishlist", JSON.stringify(wishlistItems));
    } catch (err) {
      console.error("[STORAGE ERROR] Failed to save wishlist:", err);
    }
  }, [wishlistItems, isHydrated]);

  // Add an artwork item to cart
  const addToCart = (artwork: Partial<Artwork> | any) => {
    if (!artwork || (!artwork._id && !artwork.id)) return;
    const isSold = Boolean(
      artwork.isSold === true ||
      artwork.status === "sold" ||
      artwork.status === "out_of_stock" ||
      (typeof artwork.quantity === "number" && artwork.quantity <= 0)
    );
    if (isSold) {
      toast.error("This artwork is already sold out.");
      return;
    }

    const artId = (artwork._id || artwork.id).toString();
    const existingIndex = cartItems.findIndex(
      (item) => (item._id || item.id || "").toString() === artId
    );

    const addQuantity = typeof artwork.quantity === "number" && artwork.quantity > 0 ? artwork.quantity : 1;

    if (existingIndex > -1) {
      setCartItems((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: (item.quantity || 1) + addQuantity }
            : item
        )
      );
      toast.success(`Updated cart quantity (+${addQuantity})`);
      setIsCartOpen(true);
      return;
    }

    const itemToAdd: CartItem = {
      _id: artId,
      id: artId,
      title: artwork.title || "Original Artwork",
      image: artwork.image || artwork.imageUrl || "",
      price: Number(artwork.price || 0),
      artistName: artwork.artistName || artwork.artist?.name || "Original Artist",
      artistEmail: artwork.artistEmail || artwork.userEmail || "",
      category: artwork.category || "Artwork",
      quantity: addQuantity,
    };

    setCartItems((prev) => [itemToAdd, ...prev]);
    toast.success("Added to cart!");
  };

  // Remove an item from cart (user initiated)
  const removeFromCart = (artworkId: string) => {
    if (!artworkId) return;
    const targetId = artworkId.toString();
    setCartItems((prev) => prev.filter((item) => (item._id || item.id || "").toString() !== targetId));
    toast.success("Removed from cart");
  };

  // Remove purchased item silently without toast
  const removePurchasedItem = (artworkId: string) => {
    if (!artworkId) return;
    const targetId = artworkId.toString();
    setCartItems((prev) => {
      const updated = prev.filter((item) => (item._id || item.id || "").toString() !== targetId);
      try {
        localStorage.setItem("arthub_cart", JSON.stringify(updated));
      } catch (e) {
        console.warn("Storage sync error on purchase removal:", e);
      }
      return updated;
    });
  };

  // Global listener for purchase completion events across components
  useEffect(() => {
    const onPurchased = (e: any) => {
      const artId = e?.detail?.artworkId;
      if (artId) {
        removePurchasedItem(artId);
      }
    };
    window.addEventListener("arthub_artwork_purchased", onPurchased);
    return () => window.removeEventListener("arthub_artwork_purchased", onPurchased);
  }, []);

  // Clear all items from cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Check if an item is already inside cart
  const isInCart = (artworkId: string): boolean => {
    if (!artworkId) return false;
    const targetId = artworkId.toString();
    return cartItems.some((item) => (item._id || item.id || "").toString() === targetId);
  };

  // Toggle artwork item in wishlist
  const toggleWishlist = (artwork: Partial<Artwork> | any) => {
    if (!artwork || (!artwork._id && !artwork.id)) return;
    const artId = (artwork._id || artwork.id).toString();
    const exists = wishlistItems.some((item) => (item._id || item.id || "").toString() === artId);

    if (exists) {
      setWishlistItems((prev) => prev.filter((item) => (item._id || item.id || "").toString() !== artId));
      toast.success("Removed from wishlist");
    } else {
      const itemToAdd: CartItem = {
        _id: artId,
        id: artId,
        title: artwork.title || "Original Artwork",
        image: artwork.image || artwork.imageUrl || "",
        price: Number(artwork.price || 0),
        artistName: artwork.artistName || artwork.artist?.name || "Original Artist",
        category: artwork.category || "Artwork",
      };
      setWishlistItems((prev) => [itemToAdd, ...prev]);
      toast.success("Saved to wishlist!");
    }
  };

  // Check if an item is inside wishlist
  const isInWishlist = (artworkId: string): boolean => {
    if (!artworkId) return false;
    const targetId = artworkId.toString();
    return wishlistItems.some((item) => (item._id || item.id || "").toString() === targetId);
  };

  // Aggregated calculations
  const cartCount = cartItems.length;
  const wishlistCount = wishlistItems.length;
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        addToCart,
        removeFromCart,
        removePurchasedItem,
        clearCart,
        isInCart,
        cartCount,
        cartTotal,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
