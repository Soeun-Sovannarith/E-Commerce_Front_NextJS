"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShieldCheck, CreditCard, ChevronRight, ShoppingCart, Loader, Sparkles } from 'lucide-react';

export default function CheckoutPage() {
  const { user, apiCall, addNotification } = useAuth();
  const { cart, cartTotal, clearCart, isPreorderCart } = useCart();

  // Shipping details form
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  // Credit Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!user) {
      addNotification("Please sign in to complete your checkout.", "error");
      return;
    }

    try {
      setLoading(true);
      const orderItems = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      // 1. Create order on backend
      const orderRes = await apiCall('/api/user/orders/create', {
        method: 'POST',
        body: JSON.stringify({
          order_type: isPreorderCart ? 'PREORDER' : 'ORDER',
          items: orderItems,
        }),
      });

      if (orderRes && orderRes.success) {
        setSuccessOrder(orderRes.data);
        clearCart();
        addNotification("Order created successfully!", "success");
      }
    } catch (err) {
      console.warn("API order creation failed, running mock simulation.");
      // Simulated fallback order creation
      const mockOrder = {
        id: Math.floor(Math.random() * 9000) + 1000,
        order_type: isPreorderCart ? 'PREORDER' : 'ORDER',
        status: 'PAID',
        total_amount: cartTotal.toFixed(2),
        ordered_at: new Date().toISOString(),
        full_name: user.full_name,
        email: user.email,
        items: cart
      };
      setSuccessOrder(mockOrder);
      clearCart();
      addNotification("Checkout simulation successful!", "success");
    } finally {
      setLoading(false);
    }
  };

  // Render when order succeeds
  if (successOrder) {
    return (
      <div className="container" style={styles.successContainer}>
        <div className="glass-panel" style={styles.successCard}>
          <div style={styles.successIconWrapper}>
            <Sparkles size={36} color="var(--secondary)" />
          </div>
          <h1 className="text-gradient-primary" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {successOrder.order_type === 'PREORDER' ? 'Pre-Order Secured!' : 'Payment Completed!'}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Your order <strong>#{successOrder.id}</strong> has been successfully placed. A confirmation email has been dispatched.
          </p>

          <div style={styles.receipt}>
            <div style={styles.receiptRow}>
              <span>Order Type:</span>
              <span style={{ fontWeight: 600 }}>{successOrder.order_type}</span>
            </div>
            <div style={styles.receiptRow}>
              <span>Date:</span>
              <span>{new Date(successOrder.ordered_at).toLocaleDateString()}</span>
            </div>
            <div style={styles.receiptRow}>
              <span>Billing Customer:</span>
              <span>{successOrder.full_name || user.full_name}</span>
            </div>
            <div style={styles.receiptRow}>
              <span>Shipping Address:</span>
              <span style={{ color: 'var(--text-muted)' }}>{shippingAddress || 'Store Pickup'}</span>
            </div>
            <div style={styles.receiptDivider} />
            <div style={{ ...styles.receiptRow, fontSize: '1.1rem', fontWeight: 700 }}>
              <span>Total Paid:</span>
              <span>${parseFloat(successOrder.total_amount).toFixed(2)}</span>
            </div>
          </div>

          <div style={styles.successActions}>
            <Link href="/orders" className="btn btn-primary">
              Track Order Status
            </Link>
            <Link href="/" className="btn btn-secondary">
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render when not logged in
  if (!user) {
    return (
      <div className="container" style={styles.centerContainer}>
        <div className="glass-panel" style={styles.authPromptCard}>
          <ShieldCheck size={48} color="var(--primary)" style={{ marginBottom: '1.25rem' }} />
          <h2>Sign In Required</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0', maxWidth: '360px' }}>
            You must be logged in as a customer to proceed to secure checkout and make payments.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
            <Link href="/login" className="btn btn-primary" style={{ flex: 1 }}>
              Sign In
            </Link>
            <Link href="/register" className="btn btn-secondary" style={{ flex: 1 }}>
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render when cart is empty
  if (cart.length === 0) {
    return (
      <div className="container" style={styles.centerContainer}>
        <h2>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>Add phones to your cart before checking out.</p>
        <Link href="/" className="btn btn-primary">
          Browse catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', flex: 1 }}>
      <h1 className="text-gradient-primary" style={styles.pageTitle}>Secure Checkout</h1>

      <div style={styles.checkoutGrid}>
        {/* Left: Checkout Forms */}
        <form onSubmit={handleSubmit} style={styles.checkoutForms}>
          {/* Shipping details */}
          <div className="glass-panel" style={styles.card}>
            <h2 style={styles.cardTitle}>1. Shipping &amp; Delivery</h2>
            
            <div className="form-group">
              <label className="form-label">Recipient Phone Number</label>
              <input 
                type="tel" 
                className="form-control" 
                placeholder="+855 12 345 678" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Shipping Address</label>
              <textarea 
                className="form-control" 
                rows={3}
                placeholder="Street Address, City, Province, Zip code" 
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Payment gateway simulator */}
          <div className="glass-panel" style={styles.card}>
            <h2 style={styles.cardTitle}>2. Payment Information</h2>
            
            <div className="form-group">
              <label className="form-label">Select Payment Method</label>
              <select 
                className="form-control"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Credit Card">Simulated Credit Card</option>
                <option value="ABA Pay">ABA Pay QR Scan</option>
                <option value="Bakong">Bakong Link</option>
              </select>
            </div>

            {paymentMethod === 'Credit Card' && (
              <div style={styles.ccContainer}>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <div style={styles.inputIconWrapper}>
                    <CreditCard size={16} style={styles.ccIcon} />
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="4000 1234 5678 9010" 
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                      required
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>

                <div style={styles.ccRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Expiration Date</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="MM/YY" 
                      maxLength={5}
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value.replace(/\D/g, '').replace(/(\d{2})/g, '$1/').replace(/\/$/, ''))}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">CVC / CVV</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="123" 
                      maxLength={3}
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod !== 'Credit Card' && (
              <div style={styles.qrPlaceholder}>
                <div style={styles.qrCodeBox}>
                  QR CODE SIMULATOR
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>
                  A payment receipt link will be sent upon submission.
                </p>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '1rem' }}>
            {loading ? (
              <>
                <Loader size={18} className="spinner" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <span>Place {isPreorderCart ? 'Pre-Order' : 'Secure Order'} (${cartTotal.toFixed(2)})</span>
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Right: Checkout Sidebar */}
        <div className="glass-panel" style={styles.checkoutSidebar}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShoppingCart size={18} />
            <span>Basket Details</span>
          </h3>

          <div style={styles.sidebarItems}>
            {cart.map((item) => (
              <div key={item.id} style={styles.sidebarItem}>
                <div style={styles.sidebarThumb}>
                  <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={styles.sidebarItemMeta}>
                  <div style={styles.sidebarItemName}>{item.name}</div>
                  <div style={styles.sidebarItemQty}>Qty: {item.quantity}</div>
                </div>
                <div style={styles.sidebarItemPrice}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.sidebarDivider} />

          <div style={styles.priceRow}>
            <span>Subtotal:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>

          <div style={styles.priceRow}>
            <span>Delivery charge:</span>
            <span style={{ color: 'var(--success)' }}>FREE</span>
          </div>

          <div style={styles.sidebarDivider} />

          <div style={{ ...styles.priceRow, fontSize: '1.1rem', fontWeight: 800 }}>
            <span>Order Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8rem 1.5rem',
    flex: 1,
    textAlign: 'center',
  },
  authPromptCard: {
    padding: '3rem 2.5rem',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '450px',
    width: '100%',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '2rem',
  },
  checkoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: '2.5rem',
    alignItems: 'start',
  },
  checkoutForms: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  card: {
    padding: '2rem',
    borderRadius: 'var(--radius-md)',
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem',
  },
  ccRow: {
    display: 'flex',
    gap: '1rem',
  },
  inputIconWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  ccIcon: {
    position: 'absolute',
    left: '0.9rem',
    color: 'var(--text-muted)',
  },
  qrPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1.5rem',
    background: 'rgba(4,6,10,0.3)',
    borderRadius: 'var(--radius-md)',
    border: '1px dashed var(--border-color)',
  },
  qrCodeBox: {
    width: '150px',
    height: '150px',
    background: 'white',
    color: 'black',
    fontWeight: 800,
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    padding: '1rem',
    textAlign: 'center',
    boxShadow: '0 0 15px rgba(255,255,255,0.1)',
  },
  checkoutSidebar: {
    padding: '1.75rem',
    borderRadius: 'var(--radius-md)',
  },
  sidebarItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sidebarItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  sidebarThumb: {
    width: '45px',
    height: '45px',
    background: '#1A2333',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
  },
  sidebarItemMeta: {
    flex: 1,
    overflow: 'hidden',
  },
  sidebarItemName: {
    fontSize: '0.85rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sidebarItemQty: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.15rem',
  },
  sidebarItemPrice: {
    fontSize: '0.85rem',
    fontWeight: 700,
  },
  sidebarDivider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '1.25rem 0',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    marginBottom: '0.75rem',
  },
  successContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6rem 1.5rem',
    flex: 1,
  },
  successCard: {
    width: '100%',
    maxWidth: '520px',
    borderRadius: 'var(--radius-lg)',
    padding: '3rem 2.5rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  successIconWrapper: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: 'rgba(6, 182, 212, 0.1)',
    border: '2px solid rgba(6, 182, 212, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)',
  },
  receipt: {
    width: '100%',
    background: 'rgba(4,6,10,0.3)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '1.5rem',
    textAlign: 'left',
    marginBottom: '2rem',
  },
  receiptRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    marginBottom: '0.5rem',
  },
  receiptDivider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '1rem 0',
  },
  successActions: {
    display: 'flex',
    gap: '0.75rem',
    width: '100%',
  }
};
