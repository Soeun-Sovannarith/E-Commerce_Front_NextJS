"use client";

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Trash2, ArrowRight, ShoppingBag, Info, AlertTriangle } from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount, isPreorderCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="container" style={styles.emptyContainer}>
        <ShoppingBag size={64} color="var(--text-muted)" style={{ marginBottom: '1.5rem' }} />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your Cart is Empty</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You haven't added any products to your basket yet.</p>
        <Link href="/" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', flex: 1 }}>
      <h1 className="text-gradient-primary" style={styles.pageTitle}>Shopping Cart</h1>

      <div className="cart-grid">
        {/* Left: Cart Items List */}
        <div style={styles.itemsList}>
          {isPreorderCart && (
            <div style={styles.preorderWarning}>
              <AlertTriangle size={18} color="var(--warning)" style={{ flexShrink: 0 }} />
              <div>
                <span style={{ fontWeight: 600, color: 'var(--warning)' }}>Pre-Order Mode Active: </span>
                <span>Your cart contains upcoming models. The entire order will be processed as a PRE-ORDER reservation. Release dates vary by product.</span>
              </div>
            </div>
          )}

          {cart.map((item) => (
            <div key={item.id} className="glass-panel" style={styles.cartItem}>
              {/* Product Thumbnail */}
              <div style={styles.thumbnailWrapper}>
                <img 
                  src={item.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=150'} 
                  alt={item.name}
                  style={styles.thumbnail}
                />
              </div>

              {/* Item Info */}
              <div style={styles.itemMeta}>
                <h3 style={styles.itemName}>{item.name}</h3>
                {item.preorder_available && (
                  <span className="badge badge-pending" style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}>Pre-Order</span>
                )}
                <div className="price-mobile">${item.price.toFixed(2)}</div>
              </div>

              {/* Price Desktop */}
              <div className="price-desktop">
                ${item.price.toFixed(2)}
              </div>

              {/* Quantity Changer */}
              <div style={styles.qtyContainer}>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  style={styles.qtyBtn}
                  className="hover-border"
                >
                  -
                </button>
                <span style={styles.qtyVal}>{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={styles.qtyBtn}
                  className="hover-border"
                >
                  +
                </button>
              </div>

              {/* Item Subtotal */}
              <div style={styles.subtotal}>
                ${(item.price * item.quantity).toFixed(2)}
              </div>

              {/* Delete */}
              <button 
                onClick={() => removeFromCart(item.id)}
                style={styles.deleteBtn}
                className="hover-danger-bg"
                title="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Right: Summary Box */}
        <div className="glass-panel" style={styles.summaryCard}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Order Summary</h2>
          
          <div style={styles.summaryRow}>
            <span style={{ color: 'var(--text-muted)' }}>Items ({cartCount}):</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>

          <div style={styles.summaryRow}>
            <span style={{ color: 'var(--text-muted)' }}>Shipping:</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
          </div>

          <div style={styles.summaryRow}>
            <span style={{ color: 'var(--text-muted)' }}>Tax (Estimated):</span>
            <span>$0.00</span>
          </div>

          <div style={styles.summaryRow}>
            <span style={{ color: 'var(--text-muted)' }}>Order Mode:</span>
            <span style={{ fontWeight: 600, color: isPreorderCart ? 'var(--warning)' : 'var(--success)' }}>
              {isPreorderCart ? 'PRE-ORDER' : 'STANDARD ORDER'}
            </span>
          </div>

          <div style={styles.divider} />

          <div style={{ ...styles.summaryRow, fontSize: '1.15rem', fontWeight: 800 }}>
            <span>Total amount:</span>
            <span className="text-gradient">${cartTotal.toFixed(2)}</span>
          </div>

          <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </Link>

          <div style={styles.infoFooter}>
            <Info size={14} color="var(--text-muted)" />
            <span>Payments are simulated and secure. Cancellation is available before shipping begins.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8rem 1.5rem',
    flex: 1,
    textAlign: 'center',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '2rem',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  preorderWarning: {
    display: 'flex',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    fontSize: '0.85rem',
    lineHeight: '1.5',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '1.25rem',
    borderRadius: 'var(--radius-md)',
    flexWrap: 'wrap',
  },
  thumbnailWrapper: {
    width: '70px',
    height: '70px',
    background: '#1A2333',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  itemMeta: {
    flex: '1 1 200px',
    display: 'flex',
    flexDirection: 'column',
  },
  itemName: {
    fontSize: '1.05rem',
    fontWeight: 600,
  },
  qtyContainer: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    background: 'rgba(4, 6, 10, 0.3)',
  },
  qtyBtn: {
    width: '32px',
    height: '32px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-main)',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background var(--transition-fast)',
  },
  qtyVal: {
    width: '32px',
    textAlign: 'center',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  subtotal: {
    width: '100px',
    fontSize: '1.05rem',
    fontWeight: 700,
    textAlign: 'right',
    color: 'var(--text-main)',
  },
  deleteBtn: {
    border: 'none',
    background: 'transparent',
    color: '#94A3B8',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: 'var(--radius-sm)',
    transition: 'all var(--transition-fast)',
  },
  summaryCard: {
    padding: '1.75rem',
    borderRadius: 'var(--radius-md)',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    marginBottom: '1rem',
  },
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '1.5rem 0',
  },
  infoFooter: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1.5rem',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  }
};
