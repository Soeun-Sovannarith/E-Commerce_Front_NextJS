"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('phone_store_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error('Failed to parse cart storage:', err);
      }
    }
    setLoading(false);
  }, []);

  // Save cart to local storage on changes
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('phone_store_cart', JSON.stringify(newCart));
  };

  const addToCart = (product, quantity = 1) => {
    const existingIndex = cart.findIndex((item) => item.id === product.id);
    const qtyToAdd = parseInt(quantity, 10) || 1;

    let updatedCart = [...cart];
    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += qtyToAdd;
    } else {
      updatedCart.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price) || 0,
        image_url: product.image_url,
        preorder_available: !!product.preorder_available,
        preorder_release_date: product.preorder_release_date,
        quantity: qtyToAdd,
      });
    }
    saveCart(updatedCart);
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    saveCart(updatedCart);
  };

  const updateQuantity = (productId, quantity) => {
    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cart.map((item) => {
      if (item.id === productId) {
        return { ...item, quantity: qty };
      }
      return item;
    });
    saveCart(updatedCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Determine if the cart requires pre-order processing
  // If ANY item in cart is a preorder product and stock is 0 (or preorder is available), order type should be 'PREORDER'
  const isPreorderCart = cart.some(item => item.preorder_available);

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      isPreorderCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
