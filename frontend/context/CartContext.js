"use client";

import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = "rms_cart";

function loadCartFromStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== 'undefined') {
      return loadCartFromStorage();
    }
    return [];
  });
  const [activeOrderId, setActiveOrderId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("rms_active_order") || null;
    }
    return null;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveCartToStorage(cartItems);
    }
  }, [cartItems, hydrated]);

  useEffect(() => {
    if (hydrated) {
      if (activeOrderId) {
        localStorage.setItem("rms_active_order", activeOrderId);
      } else {
        localStorage.removeItem("rms_active_order");
      }
    }
  }, [activeOrderId, hydrated]);

  const addToCart = useCallback((item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId, delta) => {
    setCartItems(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  const clearActiveOrder = useCallback(() => {
    setActiveOrderId(null);
  }, []);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      cartTotal,
      cartCount,
      activeOrderId,
      setActiveOrderId,
      clearActiveOrder,
      tableNumber,
      setTableNumber
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
