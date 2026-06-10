"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Star, ShoppingCart, Calendar, ArrowLeft, Send, CheckCircle, MessageSquare } from 'lucide-react';

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    description: "Latest Apple flagship phone with titanium design and A17 Pro chip.",
    price: "999.99",
    stock_quantity: 20,
    preorder_available: 0,
    preorder_release_date: null,
    image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600",
    is_active: 1,
    brand_id: 1,
    brand_name: "Apple",
  },
  {
    id: 2,
    name: "Galaxy S24 Ultra",
    description: "Samsung flagship featuring Galaxy AI, 200MP camera, and S-Pen.",
    price: "1299.99",
    stock_quantity: 12,
    preorder_available: 0,
    preorder_release_date: null,
    image_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600",
    is_active: 1,
    brand_id: 2,
    brand_name: "Samsung",
  },
  {
    id: 3,
    name: "iPhone 17 Pro Max (Pre-order)",
    description: "Experience the next frontier of mobile intelligence. Anticipated release late 2026.",
    price: "1399.99",
    stock_quantity: 0,
    preorder_available: 1,
    preorder_release_date: "2026-09-30T17:00:00.000Z",
    image_url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=600",
    is_active: 1,
    brand_id: 1,
    brand_name: "Apple",
  },
  {
    id: 4,
    name: "Xiaomi 14 Ultra",
    description: "Leica professional optics system with 1-inch sensor and Snapdragon 8 Gen 3.",
    price: "1099.00",
    stock_quantity: 8,
    preorder_available: 0,
    preorder_release_date: null,
    image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600",
    is_active: 1,
    brand_id: 3,
    brand_name: "Xiaomi",
  }
];

const FALLBACK_REVIEWS = [
  {
    id: 1,
    product_id: 1,
    user_id: 10,
    rating: 5,
    review_text: "Incredible phone. Titanium finish feels very premium in hand, battery life easily lasts a full day and a half. Dynamic island is super useful.",
    created_at: "2026-06-03T16:37:14.000Z",
    full_name: "Sovannarith",
    email: "soeunsovannarith@gmail.com"
  },
  {
    id: 2,
    product_id: 1,
    user_id: 11,
    rating: 4,
    review_text: "Very fast, camera is brilliant. However, it gets a bit warm during intensive gaming. Overall great purchase.",
    created_at: "2026-06-04T12:00:00.000Z",
    full_name: "Vann Sengmey",
    email: "vannsengmey748+16@gmail.com"
  }
];

export default function ProductDetailsPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const { user, apiCall, addNotification, token, loading: authLoading } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cart configuration state
  const [quantity, setQuantity] = useState(1);

  // Review submission state
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadProductData = async () => {
    if (authLoading) return;

    if (!token) {
      const found = FALLBACK_PRODUCTS.find(p => p.id === parseInt(id, 10));
      setProduct(found || null);
      setReviews(FALLBACK_REVIEWS.filter(r => r.product_id === parseInt(id, 10)));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch details
      const detailRes = await apiCall(`/api/user/products/${id}`);
      if (detailRes && detailRes.success) {
        setProduct(detailRes.data);
      } else {
        const found = FALLBACK_PRODUCTS.find(p => p.id === parseInt(id, 10));
        setProduct(found || null);
      }

      // Fetch reviews
      const reviewsRes = await apiCall(`/api/user/reviews/product/${id}`);
      if (reviewsRes && reviewsRes.success) {
        setReviews(reviewsRes.data);
      } else {
        // Filter mock reviews for this product
        setReviews(FALLBACK_REVIEWS.filter(r => r.product_id === parseInt(id, 10)));
      }
    } catch (err) {
      console.warn("Unexpected details load issue, using offline catalog fallback:", err);
      const found = FALLBACK_PRODUCTS.find(p => p.id === parseInt(id, 10));
      setProduct(found || null);
      setReviews(FALLBACK_REVIEWS.filter(r => r.product_id === parseInt(id, 10)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductData();
  }, [id, token, authLoading]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    addNotification(`${quantity}x ${product.name} added to cart`, 'success');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setSubmittingReview(true);
    const res = await apiCall('/api/user/reviews/create', {
      method: 'POST',
      body: JSON.stringify({
        product_id: parseInt(id, 10),
        rating,
        review_text: reviewText
      })
    });

    if (res && res.success) {
      addNotification("Review posted successfully!", "success");
      setReviewText('');
      setRating(5);
      // Reload page data to get the new review
      loadProductData();
    } else {
      // Offline fallback addition for testing
      addNotification("Offline mode: review added locally.", "info");
      const newMockReview = {
        id: Date.now(),
        product_id: parseInt(id, 10),
        user_id: user ? user.id : 99,
        rating,
        review_text: reviewText,
        created_at: new Date().toISOString(),
        full_name: user ? user.full_name : 'Guest User',
        email: user ? user.email : 'guest@example.com'
      };
      setReviews(prev => [newMockReview, ...prev]);
      setReviewText('');
      setRating(5);
    }
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner} />
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading smartphone details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={styles.centerContainer}>
        <h2>Smartphone Not Found</h2>
        <p style={{ color: 'var(--text-muted)' }}>The requested product does not exist or has been removed.</p>
        <Link href="/" className="btn btn-secondary btn-sm" style={{ marginTop: '1.5rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const isPreorder = !!product.preorder_available;
  const isOutOfStock = parseInt(product.stock_quantity, 10) === 0;
  
  // Calculate average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 'No reviews';

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', flex: 1 }}>
      {/* Back Link */}
      <Link href="/" style={styles.backLink}>
        <ArrowLeft size={16} />
        <span>Back to Shop</span>
      </Link>

      {/* Main product view grid */}
      <div style={styles.mainGrid} className="detail-grid-responsive">
        {/* Left: Product Image */}
        <div className="glass-panel detail-image-section" style={styles.imageSection}>
          <img 
            src={product.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600'} 
            alt={product.name}
            style={styles.mainImage}
          />
        </div>

        {/* Right: Info Section */}
        <div style={styles.infoSection}>
          <div style={styles.brandBadge}>{product.brand_name || 'Premium Series'}</div>
          <h1 style={styles.productTitle}>{product.name}</h1>

          {/* Review Summary */}
          <div style={styles.summaryRating}>
            <div style={styles.stars}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  size={18} 
                  color="#F59E0B" 
                  fill={s <= Math.round(parseFloat(avgRating) || 0) ? '#F59E0B' : 'transparent'} 
                />
              ))}
            </div>
            <span style={styles.avgText}>{avgRating} ({reviews.length} customer reviews)</span>
          </div>

          <div style={styles.priceDivider} />

          {/* Pricing */}
          <div style={styles.priceTag}>
            ${parseFloat(product.price).toFixed(2)}
          </div>

          <p style={styles.descriptionText}>{product.description || 'No description available for this model.'}</p>

          {/* Preorder Calendar Banner */}
          {isPreorder && product.preorder_release_date && (
            <div style={styles.preorderBanner}>
              <Calendar size={18} color="var(--warning)" />
              <div>
                <span style={{ fontWeight: 600, color: 'var(--warning)' }}>Pre-Order Available: </span>
                <span>Scheduled for release on {new Date(product.preorder_release_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}.</span>
              </div>
            </div>
          )}

          {/* Purchase Configuration card */}
          <div className="glass-panel" style={styles.purchaseCard}>
            <div style={styles.stockRow}>
              <span>Status:</span>
              {isPreorder ? (
                <span className="badge badge-pending">Pre-Order Reservation</span>
              ) : isOutOfStock ? (
                <span className="badge badge-cancelled">Out of Stock</span>
              ) : (
                <span className="badge badge-paid">In Stock ({product.stock_quantity} available)</span>
              )}
            </div>

            {/* Qty controls + Add trigger */}
            {(!isOutOfStock || isPreorder) && (
              <div style={styles.actionControls}>
                <div style={styles.qtyContainer}>
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    style={styles.qtyBtn}
                  >
                    -
                  </button>
                  <span style={styles.qtyVal}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => (isPreorder ? prev + 1 : Math.min(parseInt(product.stock_quantity, 10), prev + 1)))}
                    style={styles.qtyBtn}
                  >
                    +
                  </button>
                </div>

                <button 
                  onClick={handleAddToCart}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  <ShoppingCart size={18} />
                  <span>{isPreorder ? 'Pre-order Now' : 'Add to Cart'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section style={styles.reviewsSection}>
        <div style={styles.reviewsHeader}>
          <MessageSquare size={24} color="var(--primary)" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Ratings &amp; Reviews</h2>
        </div>

        <div style={styles.reviewsGrid} className="detail-reviews-grid-responsive">
          {/* Write a Review Block */}
          <div className="glass-panel" style={styles.writeReviewBox}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Write a Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label className="form-label">Your Rating</label>
                  <div style={styles.ratingSelector}>
                    {[1, 2, 3, 4, 5].map((starValue) => (
                      <button 
                        key={starValue}
                        type="button"
                        onClick={() => setRating(starValue)}
                        style={styles.starSelectBtn}
                      >
                        <Star 
                          size={24} 
                          color="#F59E0B" 
                          fill={starValue <= rating ? '#F59E0B' : 'transparent'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Review Content</label>
                  <textarea 
                    className="form-control" 
                    rows={4}
                    placeholder="Describe your experience with this device. Build quality, battery, performance..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingReview} style={{ width: '100%' }}>
                  <Send size={14} />
                  <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                </button>
              </form>
            ) : (
              <div style={styles.loginToReview}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>You must be signed in as a customer to post product reviews.</p>
                <Link href="/login" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  Sign In to Review
                </Link>
              </div>
            )}
          </div>

          {/* List of Reviews Block */}
          <div style={styles.reviewsList}>
            {reviews.length === 0 ? (
              <div className="glass-panel" style={styles.noReviews}>
                <p style={{ color: 'var(--text-muted)' }}>There are no reviews for this smartphone yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="glass-panel" style={styles.reviewItem}>
                  <div style={styles.reviewMeta}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{r.full_name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div style={styles.stars}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          size={12} 
                          color="#F59E0B" 
                          fill={s <= r.rating ? '#F59E0B' : 'transparent'} 
                        />
                      ))}
                    </div>
                  </div>
                  <p style={styles.reviewText}>{r.review_text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
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
  spinner: {
    width: '45px',
    height: '45px',
    border: '3px solid rgba(99, 102, 241, 0.1)',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--text-muted)',
    marginBottom: '2rem',
    ':hover': {
      color: 'var(--text-main)',
    }
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '3rem',
    alignItems: 'start',
    marginBottom: '4rem',
  },
  imageSection: {
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    height: '450px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#151F32',
    padding: '1.5rem',
  },
  mainImage: {
    maxHeight: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandBadge: {
    fontSize: '0.8rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--secondary)',
    letterSpacing: '0.08em',
    marginBottom: '0.5rem',
  },
  productTitle: {
    fontSize: '2.25rem',
    fontWeight: '800',
    lineHeight: '1.2',
    marginBottom: '0.75rem',
  },
  summaryRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  stars: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  avgText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  priceDivider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'var(--border-color)',
    marginBottom: '1.5rem',
  },
  priceTag: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    marginBottom: '1.5rem',
  },
  descriptionText: {
    color: 'var(--text-muted)',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  preorderBanner: {
    display: 'flex',
    alignItems: 'start',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '2rem',
    fontSize: '0.85rem',
    lineHeight: '1.5',
  },
  purchaseCard: {
    padding: '1.5rem',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  stockRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    fontWeight: 500,
  },
  actionControls: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  qtyContainer: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    background: 'rgba(4, 6, 10, 0.4)',
  },
  qtyBtn: {
    width: '40px',
    height: '40px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-main)',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'background var(--transition-fast)',
    ':hover': {
      background: 'rgba(255,255,255,0.05)',
    }
  },
  qtyVal: {
    width: '40px',
    textAlign: 'center',
    fontWeight: 600,
  },
  reviewsSection: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '3rem',
    marginTop: '2rem',
  },
  reviewsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
  },
  reviewsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2.5rem',
    alignItems: 'start',
  },
  writeReviewBox: {
    padding: '1.75rem',
    borderRadius: 'var(--radius-md)',
  },
  ratingSelector: {
    display: 'flex',
    gap: '0.4rem',
  },
  starSelectBtn: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
  },
  loginToReview: {
    padding: '1.5rem',
    textAlign: 'center',
    background: 'rgba(4, 6, 10, 0.2)',
    borderRadius: 'var(--radius-md)',
    border: '1px dashed var(--border-color)',
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  noReviews: {
    padding: '2rem',
    textAlign: 'center',
    borderRadius: 'var(--radius-md)',
  },
  reviewItem: {
    padding: '1.5rem',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-sm)',
  },
  reviewMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '1rem',
  },
  reviewText: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
  }
};
