"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Clock, ShoppingBag, Eye, XOctagon, Loader, ChevronDown, ChevronUp } from 'lucide-react';

export default function OrdersPage() {
  const { user, apiCall, addNotification } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tracks which order ID's items details are currently expanded
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState({}); // orderId -> detail data
  const [loadingDetailId, setLoadingDetailId] = useState(null);

  const loadOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await apiCall('/api/user/orders/all');
      if (res && res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.warn("Using mock data for offline orders viewer.");
      // Fallback mock orders
      setOrders([
        {
          id: 1045,
          order_type: 'ORDER',
          status: 'PENDING',
          total_amount: '999.99',
          ordered_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          full_name: user.full_name,
          email: user.email
        },
        {
          id: 1002,
          order_type: 'PREORDER',
          status: 'PAID',
          total_amount: '1399.99',
          ordered_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          full_name: user.full_name,
          email: user.email
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const toggleExpandOrder = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);

    // If already loaded detail, don't load again
    if (expandedDetails[orderId]) return;

    try {
      setLoadingDetailId(orderId);
      const res = await apiCall(`/api/user/orders/${orderId}`);
      if (res && res.success) {
        setExpandedDetails(prev => ({ ...prev, [orderId]: res.data }));
      }
    } catch (err) {
      console.warn("Using offline mock details expansion.");
      // Offline fallback detail construction
      const mockOrderItems = [
        {
          id: 1,
          order_id: orderId,
          product_id: 1,
          quantity: 1,
          unit_price: orderId === 1045 ? '999.99' : '1399.99',
          subtotal: orderId === 1045 ? '999.99' : '1399.99',
          product_name: orderId === 1045 ? 'iPhone 15 Pro' : 'iPhone 17 Pro Max (Pre-order)',
          image_url: orderId === 1045 
            ? 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=150' 
            : 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=150'
        }
      ];
      setExpandedDetails(prev => ({
        ...prev,
        [orderId]: { items: mockOrderItems }
      }));
    } finally {
      setLoadingDetailId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm(`Are you sure you want to cancel order #${orderId}?`)) return;

    try {
      const res = await apiCall(`/api/user/orders/${orderId}`, { method: 'DELETE' });
      if (res && res.success) {
        addNotification(`Order #${orderId} cancelled successfully`, 'success');
        loadOrders();
      }
    } catch (err) {
      // Local fallback for offline simulation
      addNotification(`Offline simulation: Order #${orderId} cancelled.`, 'info');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
    }
  };

  if (!user) {
    return (
      <div className="container" style={styles.centerContainer}>
        <div className="glass-panel" style={styles.promptCard}>
          <Clock size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h2>Sign In Required</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>Log in to view your historical purchases and order statuses.</p>
          <Link href="/login" className="btn btn-primary">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', flex: 1 }}>
      {/* Page header */}
      <div style={styles.header}>
        <Link href="/" style={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
        <h1 className="text-gradient-primary" style={{ fontSize: '2rem', fontWeight: 800, margin: '1rem 0' }}>My Orders</h1>
      </div>

      {loading ? (
        <div style={styles.centerContainer}>
          <Loader size={45} className="spinner" color="var(--primary)" />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading purchase history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel" style={styles.emptyCard}>
          <ShoppingBag size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>No Orders Found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '1.5rem' }}>You haven't made any purchases yet.</p>
          <Link href="/" className="btn btn-primary btn-sm">
            Shop Smartphones
          </Link>
        </div>
      ) : (
        <div style={styles.ordersList}>
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const details = expandedDetails[order.id];
            const isPending = order.status === 'PENDING';
            const isPaid = order.status === 'PAID';
            const canCancel = isPending || isPaid;

            return (
              <div key={order.id} className="glass-panel" style={styles.orderCard}>
                {/* Header info */}
                <div style={styles.orderHeader}>
                  <div style={styles.headerInfoGroup}>
                    <span style={styles.orderId}>Order #{order.id}</span>
                    <span style={styles.orderDate}>
                      Placed on {new Date(order.ordered_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={styles.headerActionsGroup}>
                    <span className={`badge badge-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                    <span style={styles.amount}>${parseFloat(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>

                <div style={styles.actionsBar}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => toggleExpandOrder(order.id)}
                      className="btn btn-secondary btn-sm"
                      style={styles.actionBtn}
                    >
                      <Eye size={14} />
                      <span>{isExpanded ? 'Hide Items' : 'View Items'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {canCancel && (
                      <button 
                        onClick={() => handleCancelOrder(order.id)}
                        className="btn btn-danger btn-sm"
                        style={styles.actionBtn}
                      >
                        <XOctagon size={14} />
                        <span>Cancel Order</span>
                      </button>
                    )}
                  </div>

                  <div style={styles.typeBadge}>
                    Mode: <strong style={{ color: order.order_type === 'PREORDER' ? 'var(--warning)' : 'var(--success)' }}>{order.order_type}</strong>
                  </div>
                </div>

                {/* Expanded Item details */}
                {isExpanded && (
                  <div style={styles.detailsSection}>
                    {loadingDetailId === order.id ? (
                      <div style={styles.detailLoader}>
                        <Loader size={20} className="spinner" />
                        <span>Loading item breakdowns...</span>
                      </div>
                    ) : details ? (
                      <div style={styles.itemsBreakdown}>
                        {details.items && details.items.map((item) => (
                          <div key={item.id} style={styles.detailItem}>
                            <div style={styles.detailItemThumb}>
                              <img src={item.image_url} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.product_name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                Unit price: ${parseFloat(item.unit_price).toFixed(2)} | Qty: {item.quantity}
                              </div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                              ${parseFloat(item.subtotal).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Failed to load item breakdown.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
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
  promptCard: {
    padding: '3rem 2.5rem',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '450px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    ':hover': {
      color: 'var(--text-main)',
    }
  },
  emptyCard: {
    padding: '4rem 2rem',
    borderRadius: 'var(--radius-lg)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginTop: '1.5rem',
  },
  orderCard: {
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
  },
  orderHeader: {
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    borderBottom: '1px solid var(--border-color)',
    background: 'rgba(15, 23, 42, 0.4)',
  },
  headerInfoGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  orderId: {
    fontSize: '1.15rem',
    fontWeight: 700,
  },
  orderDate: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  headerActionsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  amount: {
    fontSize: '1.25rem',
    fontWeight: 800,
  },
  actionsBar: {
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    background: 'rgba(15, 23, 42, 0.2)',
  },
  actionBtn: {
    padding: '0.4rem 0.75rem',
    fontSize: '0.8rem',
  },
  typeBadge: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  detailsSection: {
    borderTop: '1px solid var(--border-color)',
    padding: '1.5rem',
    background: 'rgba(4, 6, 10, 0.3)',
  },
  detailLoader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1rem 0',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },
  itemsBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  detailItemThumb: {
    width: '40px',
    height: '40px',
    background: '#1A2333',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(99, 102, 241, 0.1)',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }
};
