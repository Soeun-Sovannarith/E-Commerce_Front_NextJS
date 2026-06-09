"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Search, SlidersHorizontal, ArrowUpDown, Eye, ShoppingCart, Star } from 'lucide-react';

const MOCK_BRANDS = [
  { id: 1, name: "Apple", description: "Apple iPhone Series" },
  { id: 2, name: "Samsung", description: "Samsung Mobile Phones" },
  { id: 3, name: "Xiaomi", description: "Xiaomi Smartphones" }
];

const MOCK_PRODUCTS = [
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
    rating: 4.8
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
    rating: 4.9
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
    rating: 5.0
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
    rating: 4.7
  }
];

export default function HomePage() {
  const { apiCall, token, loading: authLoading } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-asc', 'price-desc'

  useEffect(() => {
    const loadCatalog = async () => {
      if (authLoading) return;

      if (!token) {
        setBrands(MOCK_BRANDS);
        setProducts(MOCK_PRODUCTS);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Load brands
        const brandsRes = await apiCall('/api/user/brands/all');
        // Load products
        const productsRes = await apiCall('/api/user/products/all');

        if (brandsRes && brandsRes.success) {
          setBrands(brandsRes.data);
        } else {
          setBrands(MOCK_BRANDS);
        }

        if (productsRes && productsRes.success) {
          setProducts(productsRes.data);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      } catch (err) {
        console.warn('Unexpected error loading catalog, using offline mock database:', err);
        setBrands(MOCK_BRANDS);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, [token, authLoading]);

  // Filter logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBrand = selectedBrand ? parseInt(product.brand_id, 10) === parseInt(selectedBrand, 10) : true;

    return matchesSearch && matchesBrand && product.is_active !== 0;
  });

  // Sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') {
      return parseFloat(a.price) - parseFloat(b.price);
    }
    if (sortBy === 'price-desc') {
      return parseFloat(b.price) - parseFloat(a.price);
    }
    return 0; // featured/default
  });

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', flex: 1 }}>
      {/* Hero Banner */}
      <section style={styles.hero} className="glass-panel">
        <div style={styles.heroContent}>
          <span style={styles.heroBadge}>Welcome to PhoneStore</span>
          <h1 className="text-gradient" style={styles.heroTitle}>Discover Next-Gen Mobile Power</h1>
          <p style={styles.heroSubtitle}>Explore cutting-edge flagship models, write reviews, track inventory levels, or pre-order upcoming devices instantly.</p>
          <div style={styles.heroActions}>
            <a href="#catalog" className="btn btn-primary">Browse Catalog</a>
            <Link href="/register" className="btn btn-secondary">Create Account</Link>
          </div>
        </div>
        <div style={styles.heroVisual}>
          <div style={styles.glowingOrb} />
        </div>
      </section>

      {/* Catalog Search & Filters */}
      <section id="catalog" style={styles.catalogHeader}>
        <h2 className="text-gradient-primary" style={styles.sectionTitle}>Product Catalog</h2>
        
        <div style={styles.filterBar} className="glass-panel">
          {/* Search Box */}
          <div style={styles.searchBox}>
            <Search size={18} color="var(--text-muted)" style={{ marginLeft: '0.75rem' }} />
            <input 
              type="text" 
              placeholder="Search phone model, description..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Sort By Dropdown */}
          <div style={styles.sortBox}>
            <ArrowUpDown size={18} color="var(--text-muted)" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.sortSelect}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Brand Filters */}
        <div style={styles.brandFilters}>
          <button 
            onClick={() => setSelectedBrand(null)} 
            className={`btn btn-sm ${selectedBrand === null ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button 
              key={b.id} 
              onClick={() => setSelectedBrand(b.id)} 
              className={`btn btn-sm ${selectedBrand === b.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {b.name}
            </button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      {loading ? (
        <div style={styles.loaderContainer}>
          <div style={styles.spinner} />
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading smartphones...</p>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div style={styles.emptyContainer} className="glass-panel">
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>No products found matching your criteria.</p>
          <button onClick={() => { setSearchQuery(''); setSelectedBrand(null); }} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={styles.productGrid}>
          {sortedProducts.map((p) => {
            const isPreorder = !!p.preorder_available;
            const isOutOfStock = parseInt(p.stock_quantity, 10) === 0;
            const releaseDateFormatted = p.preorder_release_date 
              ? new Date(p.preorder_release_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
              : '';

            return (
              <div key={p.id} className="glass-card" style={styles.productCard}>
                {/* Product Image Wrapper */}
                <div style={styles.imageWrapper}>
                  <img 
                    src={p.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600'} 
                    alt={p.name}
                    style={styles.productImage}
                  />
                  {isPreorder ? (
                    <span className="badge badge-pending" style={styles.preorderBadge}>Pre-Order</span>
                  ) : isOutOfStock ? (
                    <span className="badge badge-cancelled" style={styles.preorderBadge}>Out of stock</span>
                  ) : (
                    <span className="badge badge-paid" style={styles.preorderBadge}>In Stock</span>
                  )}
                </div>

                {/* Content */}
                <div style={styles.cardContent}>
                  <div style={styles.cardBrand}>{p.brand_name || 'Smartphone'}</div>
                  <h3 style={styles.cardName}>{p.name}</h3>
                  <p style={styles.cardDesc}>{p.description}</p>

                  {/* Rating indicator */}
                  <div style={styles.ratingRow}>
                    <div style={styles.stars}>
                      <Star size={14} color="#F59E0B" fill="#F59E0B" />
                      <span style={styles.ratingVal}>{p.rating || '4.5'}</span>
                    </div>
                    {!isPreorder && (
                      <span style={styles.stockVal}>{p.stock_quantity} remaining</span>
                    )}
                  </div>

                  {/* Price & Actions */}
                  <div style={styles.priceRow}>
                    <span style={styles.price}>${parseFloat(p.price).toFixed(2)}</span>
                    <div style={styles.actionButtons}>
                      <Link href={`/product/${p.id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.5rem' }} title="View details">
                        <Eye size={16} />
                      </Link>
                      
                      <button 
                        onClick={() => addToCart(p, 1)} 
                        disabled={isOutOfStock && !isPreorder}
                        className="btn btn-primary btn-sm" 
                        style={{ padding: '0.5rem 0.75rem' }}
                        title={isPreorder ? "Pre-order now" : "Add to Cart"}
                      >
                        <ShoppingCart size={16} />
                        <span>{isPreorder ? 'Pre-order' : 'Add'}</span>
                      </button>
                    </div>
                  </div>

                  {isPreorder && p.preorder_release_date && (
                    <div style={styles.releaseNotice}>
                      Releasing on {releaseDateFormatted}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  hero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '3.5rem 3rem',
    borderRadius: 'var(--radius-lg)',
    marginBottom: '4rem',
    position: 'relative',
    overflow: 'hidden',
    flexWrap: 'wrap',
    gap: '2rem',
  },
  heroContent: {
    flex: '1 1 500px',
    zIndex: 2,
  },
  heroBadge: {
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--primary)',
    display: 'inline-block',
    marginBottom: '1rem',
    padding: '0.3rem 0.75rem',
    background: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 'var(--radius-full)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: '800',
    lineHeight: '1.15',
    marginBottom: '1.25rem',
    letterSpacing: '-0.03em',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
    marginBottom: '2rem',
    maxWidth: '550px',
  },
  heroActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  heroVisual: {
    flex: '1 1 300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '250px',
    position: 'relative',
  },
  glowingOrb: {
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
    boxShadow: '0 0 60px rgba(99, 102, 241, 0.4), 0 0 100px rgba(6, 182, 212, 0.3)',
    filter: 'blur(8px)',
    animation: 'pulse 6s infinite alternate',
  },
  catalogHeader: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '1.5rem',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    gap: '1.5rem',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  },
  searchBox: {
    flex: '1 1 350px',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
  },
  searchInput: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    padding: '0.75rem 0.5rem',
    outline: 'none',
    fontSize: '0.95rem',
  },
  sortBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '0 0.75rem',
  },
  sortSelect: {
    background: 'transparent',
    border: 'none',
    padding: '0.75rem 0',
    outline: 'none',
    fontSize: '0.9rem',
    cursor: 'pointer',
    color: 'var(--text-main)',
  },
  brandFilters: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginTop: '1rem',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.75rem',
  },
  productCard: {
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  imageWrapper: {
    position: 'relative',
    height: '220px',
    background: '#1A2333',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform var(--transition-slow)',
    ':hover': {
      transform: 'scale(1.05)',
    }
  },
  preorderBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    boxShadow: 'var(--shadow-md)',
  },
  cardContent: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  cardBrand: {
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--secondary)',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem',
  },
  cardName: {
    fontSize: '1.15rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    lineHeight: '1.3',
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    marginBottom: '1rem',
    lineHeight: '1.5',
    height: '2.55rem',
  },
  ratingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
    fontSize: '0.8rem',
  },
  stars: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  ratingVal: {
    color: 'var(--text-main)',
    fontWeight: '600',
  },
  stockVal: {
    color: 'var(--text-muted)',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  price: {
    fontSize: '1.35rem',
    fontWeight: '800',
    color: 'var(--text-main)',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  releaseNotice: {
    fontSize: '0.75rem',
    color: 'var(--warning)',
    marginTop: '0.75rem',
    textAlign: 'center',
    background: 'rgba(245, 158, 11, 0.08)',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(245, 158, 11, 0.15)',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5rem 0',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(99, 102, 241, 0.1)',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    borderRadius: 'var(--radius-lg)',
    textAlign: 'center',
  }
};
