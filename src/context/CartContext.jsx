/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

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
  const addToCart = (artwork) => {
    if (!artwork || !artwork._id) return;
    if (artwork.isSold) {
      toast.error("This artwork is already sold out.");
      return;
    }

    const artId = artwork._id.toString();
    const existingIndex = cartItems.findIndex(
      (item) => item._id.toString() === artId
    );

    if (existingIndex > -1) {
      toast("Artwork is already in your cart.");
      setIsCartOpen(true);
      return;
    }


    const itemToAdd = {
      _id: artId,
      title: artwork.title || "Original Artwork",
      image: artwork.image || artwork.imageUrl || "",
      price: Number(artwork.price || 0),
      artistName: artwork.artistName || artwork.artist?.name || "Original Artist",
      category: artwork.category || "Artwork",
      isSold: Boolean(artwork.isSold),
    };

    setCartItems((prev) => [itemToAdd, ...prev]);
    toast.success("Added to cart!");
  };

  // Remove an item from cart
  const removeFromCart = (artworkId) => {
    if (!artworkId) return;
    const targetId = artworkId.toString();
    setCartItems((prev) => prev.filter((item) => item._id.toString() !== targetId));
    toast.success("Removed from cart");
  };

  // Clear all items from cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Check if an item is already inside cart
  const isInCart = (artworkId) => {
    if (!artworkId) return false;
    const targetId = artworkId.toString();
    return cartItems.some((item) => item._id.toString() === targetId);
  };

  // Toggle artwork item in wishlist
  const toggleWishlist = (artwork) => {
    if (!artwork || !artwork._id) return;
    const artId = artwork._id.toString();
    const exists = wishlistItems.some((item) => item._id.toString() === artId);

    if (exists) {
      setWishlistItems((prev) => prev.filter((item) => item._id.toString() !== artId));
      toast.success("Removed from wishlist");
    } else {
      const itemToAdd = {
        _id: artId,
        title: artwork.title || "Original Artwork",
        image: artwork.image || artwork.imageUrl || "",
        price: Number(artwork.price || 0),
        artistName: artwork.artistName || artwork.artist?.name || "Original Artist",
        category: artwork.category || "Artwork",
        isSold: Boolean(artwork.isSold),
      };
      setWishlistItems((prev) => [itemToAdd, ...prev]);
      toast.success("Saved to wishlist!");
    }
  };

  // Check if an item is inside wishlist
  const isInWishlist = (artworkId) => {
    if (!artworkId) return false;
    const targetId = artworkId.toString();
    return wishlistItems.some((item) => item._id.toString() === targetId);
  };

  // Aggregated calculations
  const cartCount = cartItems.length;
  const wishlistCount = wishlistItems.length;
  const cartTotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        addToCart,
        removeFromCart,
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

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
