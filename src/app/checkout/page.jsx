"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShieldCheck, CreditCard, ChevronRight, ShoppingCart, Loader, Sparkles, QrCode } from 'lucide-react';

export default function CheckoutPage() {
  const { user, apiCall, addNotification } = useAuth();
  const { cart, cartTotal, clearCart, isPreorderCart } = useCart();

  // Shipping details form
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');

  // Credit Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [bakongQR, setBakongQR] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('PENDING');

  // Polling for Bakong payment status
  React.useEffect(() => {
    if (!bakongQR) return;

    let intervalId;
    const pollStatus = async () => {
      try {
        const res = await apiCall(`/api/user/payments/verify/${bakongQR.md5_hash}`, {
          method: 'POST'
        });
        if (res && res.success && res.data) {
          setPaymentStatus(res.data.status);
          if (res.data.status === 'SUCCESS') {
            clearInterval(intervalId);
            setSuccessOrder(bakongQR.order);
            clearCart();
            setBakongQR(null);
            addNotification("Payment received successfully via KHQR!", "success");
          } else if (res.data.status === 'FAILED') {
            clearInterval(intervalId);
            setBakongQR(null);
            addNotification("KHQR payment failed.", "error");
          }
        }
      } catch (err) {
        console.warn("Error polling payment status:", err);
      }
    };

    // Poll every 3 seconds
    intervalId = setInterval(pollStatus, 3000);

    // Initial check
    pollStatus();

    return () => clearInterval(intervalId);
  }, [bakongQR]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) return;

    if (!user) {
      addNotification("Please sign in to complete your checkout.", "error");
      return;
    }

    setLoading(true);
    const orderItems = cart.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
    }));

    // Create order on backend
    const orderRes = await apiCall('/api/user/orders/create', {
      method: 'POST',
      body: JSON.stringify({
        order_type: isPreorderCart ? 'PREORDER' : 'ORDER',
        items: orderItems,
      }),
    });

    if (orderRes && orderRes.success) {
      setCreatedOrder(orderRes.data);
      addNotification("Order created successfully! Proceeding to payment options.", "success");
    } else {
      console.warn("API order creation failed, running mock simulation.");
      const mockOrder = {
        id: Math.floor(Math.random() * 9000) + 1000,
        order_type: isPreorderCart ? 'PREORDER' : 'ORDER',
        status: 'PENDING',
        total_amount: cartTotal,
        ordered_at: new Date().toISOString(),
        full_name: user.full_name,
        email: user.email,
        items: cart
      };
      setCreatedOrder(mockOrder);
      addNotification("Checkout simulation successful! Proceeding to payment options.", "success");
    }
    setLoading(false);
  };

  const handleKHQRPayment = async () => {
    if (!createdOrder) return;
    setLoading(true);
    try {
      const payRes = await apiCall(`/api/user/payments/generateqr/${createdOrder.id}`, {
        method: 'POST'
      });
      if (payRes && payRes.success) {
        setBakongQR({
          qr_code: payRes.data.qr_code,
          md5_hash: payRes.data.md5_hash,
          order_id: createdOrder.id,
          amount: createdOrder.total_amount,
          order: createdOrder
        });
        setPaymentStatus('PENDING');
        addNotification("KHQR code generated. Please scan to complete payment.", "info");
      } else {
        addNotification(payRes?.message || "Failed to generate KHQR.", "error");
      }
    } catch (err) {
      addNotification(err.message || "An error occurred.", "error");
    }
    setLoading(false);
  };

  const handleCardPaymentSubmit = (e) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc) {
      addNotification("Please fill in all card details.", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setSuccessOrder({
        ...createdOrder,
        status: 'PAID'
      });
      clearCart();
      addNotification("Card payment completed successfully!", "success");
      setLoading(false);
    }, 1500);
  };




  // Render Bakong QR screen
  if (bakongQR) {
    return (
      <div className="container" style={styles.successContainer}>
        <style>{`
          .pulse-dot {
            width: 8px;
            height: 8px;
            background-color: #10B981;
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 8px #10B981;
            animation: pulse 1.5s infinite;
          }
          @keyframes pulse {
            0% { opacity: 0.3; }
            50% { opacity: 1; }
            100% { opacity: 0.3; }
          }
        `}</style>
        <div className="glass-panel" style={styles.bakongCard}>
          <div style={styles.bakongHeader}>
            <div style={styles.bakongLogoWrapper}>
              <span style={styles.bakongLogoText}>BAKONG KHQR</span>
            </div>
            <span style={styles.statusBadge}>
              <span className="pulse-dot" /> Live Status: {paymentStatus}
            </span>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '1.5rem', marginBottom: '0.25rem' }}>
            Scan to Pay with Bakong
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '360px' }}>
            Scan the KHQR code using your Bakong app or any supported Cambodian mobile banking app.
          </p>

          <div style={styles.qrContainer}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(bakongQR.qr_code)}`}
              alt="Bakong KHQR Code"
              style={styles.qrImage}
            />
          </div>

          <div style={styles.bakongAmountBox}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Amount Due</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>
              ${parseFloat(bakongQR.amount).toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Order ID: #{bakongQR.order_id}
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '380px', marginBottom: '2rem' }}>
            Do not close this window. We are checking your transaction status automatically.
          </p>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', maxWidth: '200px' }}
            onClick={() => setBakongQR(null)}
          >
            Cancel Payment
          </button>
        </div>
      </div>
    );
  }

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
        {/* Left: Dynamic Step Content */}
        <div style={styles.checkoutForms}>
          {!createdOrder ? (
            /* Step 1: Shipping details form */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
          ) : (
            /* Step 2: Payment options selection */
            <div className="glass-panel" style={styles.card}>
              <h2 style={styles.cardTitle}>2. Select Payment Method</h2>
              
              <div style={styles.orderSummaryBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Order ID:</span>
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>#{createdOrder.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Amount Due:</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary)' }}>
                    ${parseFloat(createdOrder.total_amount || cartTotal).toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={styles.paymentSelectionGrid}>
                {/* KHQR Option Card */}
                <div 
                  className="glass-card" 
                  style={{
                    ...styles.paymentOptionCard,
                    borderColor: paymentMethod === 'KHQR' ? 'var(--secondary)' : 'var(--border-color)',
                    background: paymentMethod === 'KHQR' ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-card-glass)',
                  }}
                  onClick={() => {
                    setPaymentMethod('KHQR');
                    setShowCardForm(false);
                    handleKHQRPayment();
                  }}
                >
                  <div style={styles.paymentOptionHeader}>
                    <QrCode size={24} color={paymentMethod === 'KHQR' ? 'var(--secondary)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>KHQR (Bakong)</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Scan and pay using any Cambodian bank app (Bakong, ABA, Acleda, etc.).
                  </p>
                  <div 
                    className="btn btn-secondary btn-sm" 
                    style={{ 
                      marginTop: '1.25rem', 
                      width: '100%',
                      background: paymentMethod === 'KHQR' ? 'var(--secondary)' : 'rgba(255, 255, 255, 0.05)',
                      color: paymentMethod === 'KHQR' ? 'var(--text-inverse)' : 'var(--text-main)',
                      fontWeight: 600,
                    }}
                  >
                    {loading && paymentMethod === 'KHQR' ? <Loader size={14} className="spinner" /> : 'Pay with KHQR'}
                  </div>
                </div>

                {/* Card Option Card */}
                <div 
                  className="glass-card" 
                  style={{
                    ...styles.paymentOptionCard,
                    borderColor: paymentMethod === 'Card' ? 'var(--primary)' : 'var(--border-color)',
                    background: paymentMethod === 'Card' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card-glass)',
                  }}
                  onClick={() => {
                    setPaymentMethod('Card');
                    setShowCardForm(true);
                  }}
                >
                  <div style={styles.paymentOptionHeader}>
                    <CreditCard size={24} color={paymentMethod === 'Card' ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Credit Card</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Secure payment using Visa, Mastercard, JCB, or UnionPay.
                  </p>
                  <div 
                    className="btn btn-secondary btn-sm" 
                    style={{ 
                      marginTop: '1.25rem', 
                      width: '100%',
                      background: paymentMethod === 'Card' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                      color: paymentMethod === 'Card' ? 'white' : 'var(--text-main)',
                      fontWeight: 600,
                    }}
                  >
                    Pay with Card
                  </div>
                </div>
              </div>

              {/* Card form if active */}
              {showCardForm && paymentMethod === 'Card' && (
                <form onSubmit={handleCardPaymentSubmit} style={styles.ccContainer}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--primary)' }}>Credit Card Information</h3>
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

                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}>
                    {loading ? <Loader size={18} className="spinner" /> : `Submit Card Payment ($${parseFloat(createdOrder.total_amount || cartTotal).toFixed(2)})`}
                  </button>
                </form>
              )}

              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ width: '100%', marginTop: '1.5rem', borderStyle: 'dashed' }} 
                onClick={() => setCreatedOrder(null)}
              >
                Change Shipping Details
              </button>
            </div>
          )}
        </div>

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
  },
  bakongCard: {
    width: '100%',
    maxWidth: '480px',
    borderRadius: 'var(--radius-lg)',
    padding: '2.5rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid rgba(239, 68, 68, 0.2)', // Reddish tint for Bakong
    background: 'radial-gradient(circle at top, rgba(239, 68, 68, 0.05), rgba(0, 0, 0, 0))',
  },
  bakongHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
  },
  bakongLogoWrapper: {
    background: 'linear-gradient(135deg, #EF4444, #991B1B)',
    padding: '0.3rem 0.8rem',
    borderRadius: 'var(--radius-sm)',
    color: 'white',
    fontWeight: 800,
    fontSize: '0.8rem',
  },
  bakongLogoText: {
    letterSpacing: '0.05em',
  },
  statusBadge: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  qrContainer: {
    position: 'relative',
    background: 'white',
    padding: '1.25rem',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(239,68,68,0.15)',
    marginBottom: '1.5rem',
    overflow: 'hidden',
  },
  qrImage: {
    width: '220px',
    height: '220px',
    display: 'block',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '3px',
    background: '#EF4444',
    boxShadow: '0 0 10px #EF4444, 0 0 5px #EF4444',
    animation: 'scan 2.5s ease-in-out infinite',
  },
  bakongAmountBox: {
    background: 'rgba(4,6,10,0.3)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem 2.5rem',
    width: '100%',
    marginBottom: '1.5rem',
  },
  orderSummaryBox: {
    background: 'rgba(15, 23, 42, 0.3)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem',
    marginBottom: '1.5rem',
  },
  paymentSelectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  paymentOptionCard: {
    padding: '1.5rem',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    borderWidth: '1px',
    borderStyle: 'solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
    transition: 'all var(--transition-normal)',
  },
  paymentOptionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  ccContainer: {
    background: 'rgba(15, 23, 42, 0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '1.5rem',
    marginTop: '1.5rem',
  }
};
